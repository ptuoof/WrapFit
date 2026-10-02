import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { TrashPurgeTask } from '../src/modules/projects/presentation/trash-purge.task';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * File uploads (IT3-08) against a real S3-compatible server: the local SeaweedFS of docker-compose.yml
 * (`docker compose up -d seaweedfs storage-init`), see test/e2e-env.ts.
 */
describe('Storage (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const run = Date.now();
  const MB = 1024 * 1024;
  let kim: { cookie: string };
  let leo: { cookie: string };

  const api = () => request(app.getHttpServer());
  const as = (user: { cookie: string }) => ({
    get: (url: string) => api().get(url).set('Cookie', user.cookie),
    post: (url: string) => api().post(url).set('Cookie', user.cookie),
    patch: (url: string) => api().patch(url).set('Cookie', user.cookie),
    delete: (url: string) => api().delete(url).set('Cookie', user.cookie),
  });
  const register = async (name: string) => {
    const res = await api()
      .post('/api/auth/register')
      .send({ email: `${name}-${run}@e2e.test`, password: 'Passw0rd123' })
      .expect(201);
    const header = res.headers['set-cookie'] as unknown as string[];
    return { cookie: header.find((line) => line.startsWith('wf_access='))!.split(';')[0] };
  };
  const presign = (user: { cookie: string }, body: Record<string, unknown>) =>
    as(user).post('/api/storage/presigned-upload').send(body);
  // Cast: the DOM `BodyInit` typing does not accept Node's typed arrays, although fetch does.
  const png = (bytes: number) => new Uint8Array(bytes).fill(7) as unknown as RequestInit['body'] & Uint8Array;
  /** Uploads like the browser would: PUT to the pre-signed URL with the returned headers. */
  const upload = (ticket: { uploadUrl: string; headers: Record<string, string> }, body: RequestInit['body'], headers = ticket.headers) =>
    fetch(ticket.uploadUrl, { method: 'PUT', headers, body });
  const newProject = async (user: { cookie: string }) =>
    (
      await as(user)
        .post('/api/projects')
        .send({ templateId: 'tuck-top', title: 'Hộp có ảnh', dimensions: { length: 120, width: 80, height: 60 } })
        .expect(201)
    ).body.id as string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    kim = await register('kim');
    leo = await register('leo');
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { endsWith: '@e2e.test' } } });
    await app.close();
  });

  it('requires authentication', async () => {
    await api().post('/api/storage/presigned-upload').send({ purpose: 'LOGO', contentType: 'image/png', size: 10 }).expect(401);
    await api().get('/api/storage/usage').expect(401);
  });

  it('starts with an empty quota that depends on the subscription tier', async () => {
    const res = await as(kim).get('/api/storage/usage').expect(200);
    expect(res.body).toEqual({ tier: 'FREE', usedBytes: 0, quotaBytes: 100 * MB, fileCount: 0 });
  });

  describe('upload with a pre-signed URL', () => {
    let ticket: { uploadUrl: string; headers: Record<string, string>; fileUrl: string; key: string };

    beforeAll(async () => {
      ticket = (await presign(kim, { purpose: 'LOGO', contentType: 'image/png', size: 1000 }).expect(200)).body;
    });

    it('returns a short-lived PUT URL and the public URL of the file', () => {
      expect(ticket).toMatchObject({
        fileId: expect.any(String),
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        expiresIn: 300,
      });
      expect(ticket.key).toMatch(/^users\/[0-9a-f-]{36}\/logo\/[0-9a-f-]{36}\.png$/);
      expect(ticket.fileUrl).toBe(`http://localhost:8333/wrapfit/${ticket.key}`);
    });

    it('refuses a file of another size or another type than signed', async () => {
      expect((await upload(ticket, png(5000))).status).toBe(403);
      expect((await upload(ticket, png(1000), { 'Content-Type': 'text/html' })).status).toBe(403);
    });

    it('stores the file, readable by anyone at its public URL', async () => {
      expect((await upload(ticket, png(1000))).status).toBe(200);

      const file = await fetch(ticket.fileUrl);
      expect(file.status).toBe(200);
      expect(file.headers.get('content-type')).toBe('image/png');
      expect(new Uint8Array(await file.arrayBuffer())).toEqual(png(1000));

      // Nobody can write to the bucket without a signature.
      expect((await fetch(ticket.fileUrl, { method: 'PUT', body: png(10) })).status).toBe(403);
    });

    it('counts the file in my usage', async () => {
      const res = await as(kim).get('/api/storage/usage').expect(200);
      expect(res.body).toMatchObject({ usedBytes: 1000, fileCount: 1 });
    });
  });

  describe('rules', () => {
    it('checks the format and the size for each purpose', async () => {
      const svgImage = await presign(kim, { purpose: 'IMAGE', contentType: 'image/svg+xml', size: 10 }).expect(400);
      expect(svgImage.body.message).toBe('contentType must be one of: image/png, image/jpeg, image/webp');
      await presign(kim, { purpose: 'LOGO', contentType: 'image/svg+xml', size: 10 }).expect(200);
      await presign(kim, { purpose: 'LOGO', contentType: 'application/pdf', size: 15 * MB }).expect(200);

      const big = await presign(kim, { purpose: 'THUMBNAIL', contentType: 'image/webp', size: 2 * MB + 1 }).expect(413);
      expect(big.body).toMatchObject({ error: 'Payload Too Large', message: 'A THUMBNAIL file can be at most 2 MB' });
      await presign(kim, { purpose: 'LOGO', contentType: 'image/png', size: 15 * MB + 1 }).expect(413);

      await presign(kim, { purpose: 'VIDEO', contentType: 'image/png', size: 10 }).expect(400);
      await presign(kim, { purpose: 'LOGO', contentType: 'image/png', size: 0 }).expect(400);
      await presign(kim, { purpose: 'LOGO', contentType: 'image/png', size: 10, key: 'users/x/hack.png' }).expect(400);
    });

    it('only attaches files to my own projects that are not in the trash', async () => {
      const mine = await newProject(kim);
      await presign(leo, { purpose: 'THUMBNAIL', contentType: 'image/png', size: 10, projectId: mine }).expect(404);

      await as(kim).patch(`/api/projects/${mine}/status`).send({ status: 'DELETED' }).expect(200);
      await presign(kim, { purpose: 'THUMBNAIL', contentType: 'image/png', size: 10, projectId: mine }).expect(409);
    });

    it('stops at the quota of the FREE tier (100 MB)', async () => {
      for (let i = 0; i < 6; i++) {
        await presign(leo, { purpose: 'LOGO', contentType: 'application/pdf', size: 15 * MB }).expect(200);
      }
      const res = await presign(leo, { purpose: 'LOGO', contentType: 'application/pdf', size: 15 * MB }).expect(403);
      expect(res.body.message).toBe('Storage quota exceeded: 90 MB of 100 MB used');
    });
  });

  describe('files of deleted projects', () => {
    const uploadThumbnail = async (projectId: string) => {
      const ticket = (
        await presign(kim, { purpose: 'THUMBNAIL', contentType: 'image/webp', size: 300, projectId }).expect(200)
      ).body;
      expect((await upload(ticket, png(300))).status).toBe(200);
      await as(kim).patch(`/api/projects/${projectId}`).send({ thumbnailUrl: ticket.fileUrl.replace('http:', 'https:') });
      return ticket.fileUrl as string;
    };

    it('are deleted from the bucket when the project is deleted permanently', async () => {
      const projectId = await newProject(kim);
      const fileUrl = await uploadThumbnail(projectId);
      expect((await fetch(fileUrl)).status).toBe(200);

      await as(kim).patch(`/api/projects/${projectId}/status`).send({ status: 'DELETED' }).expect(200);
      await as(kim).delete(`/api/projects/${projectId}`).expect(204);

      expect((await fetch(fileUrl)).status).toBe(404);
      expect(await prisma.storedFile.count({ where: { projectId } })).toBe(0);
    });

    it('are deleted by the trash purge, but kept for projects restored in time', async () => {
      const expired = await newProject(kim);
      const restored = await newProject(kim);
      const expiredFile = await uploadThumbnail(expired);
      const restoredFile = await uploadThumbnail(restored);
      for (const id of [expired, restored]) {
        await as(kim).patch(`/api/projects/${id}/status`).send({ status: 'DELETED' }).expect(200);
      }
      await prisma.packagingProject.update({
        where: { id: expired },
        data: { deletedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) },
      });
      await as(kim).patch(`/api/projects/${restored}/status`).send({ status: 'ACTIVE' }).expect(200);

      await app.get(TrashPurgeTask).run();

      expect((await fetch(expiredFile)).status).toBe(404);
      expect((await fetch(restoredFile)).status).toBe(200);
    });
  });
});
