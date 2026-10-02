import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TrashPurgeTask } from '../src/modules/projects/presentation/trash-purge.task';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Projects CRUD (IT3-03), lifecycle, duplicate, snapshots and trash purge (IT3-04). Needs the migrated and seeded database (box templates).
 * Users use the `@e2e.test` domain; deleting them cascades to their projects and collections.
 */
describe('Projects API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const run = Date.now();
  let carol: { id: string; cookie: string };
  let dave: { id: string; cookie: string };
  let carolCollection: string;
  let daveCollection: string;

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
    const access = header.find((line) => line.startsWith('wf_access='))!.split(';')[0];
    return { id: res.body.user.id as string, cookie: access };
  };

  const newProject = (overrides: Record<string, unknown> = {}) => ({
    templateId: 'tuck-top',
    title: 'Hộp nến thơm',
    dimensions: { length: 120, width: 80, height: 60 },
    ...overrides,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    carol = await register('carol');
    dave = await register('dave');
    carolCollection = (await as(carol).post('/api/collections').send({ title: 'Tết 2026' }).expect(201)).body.id;
    daveCollection = (await as(dave).post('/api/collections').send({ title: 'Dave' }).expect(201)).body.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { endsWith: '@e2e.test' } } });
    await app.close();
  });

  it('requires authentication', async () => {
    await api().get('/api/projects').expect(401);
    await api().post('/api/projects').send(newProject()).expect(401);
  });

  describe('create', () => {
    it('creates a project with defaults filled in', async () => {
      const res = await as(carol)
        .post('/api/projects')
        .send(newProject({ title: '  Hộp nến thơm  ', tags: ['Tet', ' tet ', 'nen-thom'], collectionId: carolCollection }))
        .expect(201);

      expect(res.body).toMatchObject({
        title: 'Hộp nến thơm',
        status: 'ACTIVE',
        visibility: 'PRIVATE',
        template: { id: 'tuck-top' },
        collection: { id: carolCollection, title: 'Tết 2026' },
        dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.35 },
        materialSpec: { type: 'ivory', gsm: 300, caliper: 0.35, finish: 'matte' },
        canvasState: { elements: [] },
        tags: ['tet', 'nen-thom'],
      });
      expect(res.body.slug).toMatch(/^[\w-]{10}$/);
      expect(res.body.userId).toBeUndefined();
    });

    it('stores a canvas that follows the @wrapfit/shared contract', async () => {
      const element = {
        id: 'el-1',
        type: 'text',
        panelId: 'front',
        x: 10,
        y: 12,
        width: 60,
        height: 20,
        rotation: 0,
        content: 'Chúc mừng năm mới',
        style: { fontFamily: 'Lora', fontSize: 14, color: '#2B1E16' },
      };
      const res = await as(carol)
        .post('/api/projects')
        .send(
          newProject({
            templateId: 'pillow',
            title: 'Hộp gối trang sức',
            materialSpec: { type: 'kraft', gsm: 350, caliper: 0.45, finish: 'raw' },
            canvasState: { elements: [element] },
          }),
        )
        .expect(201);
      expect(res.body.canvasState).toEqual({ elements: [element] });
      expect(res.body.dimensions.paperThickness).toBe(0.45);
    });

    it('rejects invalid payloads with readable messages', async () => {
      const res = await as(carol)
        .post('/api/projects')
        .send(newProject({ dimensions: { length: 10, width: 80, height: 60 } }))
        .expect(400);
      expect(res.body.message).toEqual(['dimensions.length must not be less than 40']);

      await as(carol).post('/api/projects').send(newProject({ templateId: 'mystery-box' })).expect(400);
      await as(carol).post('/api/projects').send(newProject({ title: '   ' })).expect(400);
      await as(carol)
        .post('/api/projects')
        .send(newProject({ materialSpec: { type: 'plastic', gsm: 300, caliper: 0.3, finish: 'matte' } }))
        .expect(400);
      await as(carol)
        .post('/api/projects')
        .send(newProject({ canvasState: { elements: [{ id: 'x', type: 'video' }] } }))
        .expect(400);
      // Fields outside the API contract (owner, status...) are refused.
      await as(carol).post('/api/projects').send(newProject({ userId: dave.id })).expect(400);
      await as(carol).post('/api/projects').send(newProject({ status: 'DELETED' })).expect(400);
    });

    it("refuses to put a project in another user's collection", async () => {
      const res = await as(carol)
        .post('/api/projects')
        .send(newProject({ collectionId: daveCollection }))
        .expect(400);
      expect(res.body.message).toBe('collectionId must be one of your collections');
    });
  });

  describe('list', () => {
    beforeAll(async () => {
      await as(carol).post('/api/projects').send(newProject({ title: 'Hộp bánh trung thu' })).expect(201);
      const archived = await as(carol).post('/api/projects').send(newProject({ title: 'Hộp cũ' })).expect(201);
      await as(carol).patch(`/api/projects/${archived.body.id}/status`).send({ status: 'ARCHIVED' }).expect(200);
      await as(dave).post('/api/projects').send(newProject({ title: 'Hộp nến của Dave' })).expect(201);
    });

    it('returns only my active projects, newest first, without the canvas', async () => {
      const res = await as(carol).get('/api/projects').expect(200);
      expect(res.body.meta).toEqual({ total: 3, page: 1, limit: 20, totalPages: 1 });
      expect(res.body.items.map((p: { title: string }) => p.title)).toEqual([
        'Hộp bánh trung thu',
        'Hộp gối trang sức',
        'Hộp nến thơm',
      ]);
      expect(res.body.items[0].canvasState).toBeUndefined();
    });

    it('filters by status, collection and search text', async () => {
      const titles = async (query: string) =>
        (await as(carol).get(`/api/projects?${query}`).expect(200)).body.items.map((p: { title: string }) => p.title);

      expect(await titles('status=ARCHIVED')).toEqual(['Hộp cũ']);
      expect(await titles(`collectionId=${carolCollection}`)).toEqual(['Hộp nến thơm']);
      expect(await titles('collectionId=none&sortBy=title&order=asc')).toEqual(['Hộp bánh trung thu', 'Hộp gối trang sức']);
      expect(await titles(`q=${encodeURIComponent('TRUNG THU')}`)).toEqual(['Hộp bánh trung thu']);
      expect(await titles('q=Tet')).toEqual(['Hộp nến thơm']); // exact tag
    });

    it('paginates and validates the query', async () => {
      const res = await as(carol).get('/api/projects?limit=2&page=2').expect(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.meta).toEqual({ total: 3, page: 2, limit: 2, totalPages: 2 });

      await as(carol).get('/api/projects?status=GONE').expect(400);
      await as(carol).get('/api/projects?collectionId=abc').expect(400);
      await as(carol).get('/api/projects?sortBy=userId').expect(400);
    });
  });

  describe('read, update, delete', () => {
    let projectId: string;

    beforeAll(async () => {
      projectId = (await as(carol).post('/api/projects').send(newProject({ title: 'Hộp để sửa' })).expect(201)).body.id;
    });

    it('returns the project to its owner only', async () => {
      const res = await as(carol).get(`/api/projects/${projectId}`).expect(200);
      expect(res.body).toMatchObject({ id: projectId, title: 'Hộp để sửa', canvasState: { elements: [] } });

      // Another user cannot tell the project exists.
      const hidden = await as(dave).get(`/api/projects/${projectId}`).expect(404);
      expect(hidden.body.message).toBe('Project not found');
      await as(dave).patch(`/api/projects/${projectId}`).send({ title: 'hijack' }).expect(404);
      await as(dave).delete(`/api/projects/${projectId}`).expect(404);

      await as(carol).get('/api/projects/not-a-uuid').expect(400);
      await as(carol).get('/api/projects/7d0c3f6e-2f1a-4c55-9a43-2a0f5a7c9b11').expect(404);
    });

    it('updates fields and re-validates dimensions against the template', async () => {
      const res = await as(carol)
        .patch(`/api/projects/${projectId}`)
        .send({
          title: 'Hộp đã sửa',
          dimensions: { length: 150, width: 90, height: 70, paperThickness: 0.5 },
          collectionId: carolCollection,
          thumbnailUrl: 'https://cdn.wrapfit.vn/thumbs/1.png',
          tags: ['Moi'],
        })
        .expect(200);
      expect(res.body).toMatchObject({
        title: 'Hộp đã sửa',
        dimensions: { length: 150, width: 90, height: 70, paperThickness: 0.5 },
        collection: { id: carolCollection },
        thumbnailUrl: 'https://cdn.wrapfit.vn/thumbs/1.png',
        tags: ['moi'],
      });

      const cleared = await as(carol)
        .patch(`/api/projects/${projectId}`)
        .send({ collectionId: null, thumbnailUrl: null })
        .expect(200);
      expect(cleared.body).toMatchObject({ title: 'Hộp đã sửa', collection: null, thumbnailUrl: null });

      await as(carol)
        .patch(`/api/projects/${projectId}`)
        .send({ dimensions: { length: 700, width: 90, height: 70 } })
        .expect(400);
      await as(carol).patch(`/api/projects/${projectId}`).send({ templateId: 'pillow' }).expect(400);
      await as(carol).patch(`/api/projects/${projectId}`).send({ thumbnailUrl: 'http://insecure.example/a.png' }).expect(400);
    });

    it('deletes permanently only from the trash, and a trashed project is read-only', async () => {
      const notInTrash = await as(carol).delete(`/api/projects/${projectId}`).expect(409);
      expect(notInTrash.body.message).toBe('Move the project to the trash before deleting it permanently');

      await as(carol).patch(`/api/projects/${projectId}/status`).send({ status: 'DELETED' }).expect(200);
      await as(carol).patch(`/api/projects/${projectId}`).send({ title: 'x' }).expect(409);

      await as(carol).delete(`/api/projects/${projectId}`).expect(204);
      await as(carol).get(`/api/projects/${projectId}`).expect(404);
    });
  });

  describe('lifecycle: archive, trash, restore', () => {
    let projectId: string;
    const setStatus = (status: string, user = carol) =>
      as(user).patch(`/api/projects/${projectId}/status`).send({ status });

    beforeAll(async () => {
      projectId = (await as(carol).post('/api/projects').send(newProject({ title: 'Hộp vòng đời' })).expect(201)).body.id;
    });

    it('archives and un-archives', async () => {
      expect((await setStatus('ARCHIVED').expect(200)).body).toMatchObject({ status: 'ARCHIVED', deletedAt: null });
      expect((await setStatus('ACTIVE').expect(200)).body).toMatchObject({ status: 'ACTIVE', deletedAt: null });
    });

    it('moves to the trash with a timestamp, idempotently, and restores', async () => {
      const trashed = (await setStatus('DELETED').expect(200)).body;
      expect(trashed.status).toBe('DELETED');
      expect(Date.now() - new Date(trashed.deletedAt).getTime()).toBeLessThan(60_000);

      // Trashing again must not restart the 30-day countdown.
      expect((await setStatus('DELETED').expect(200)).body.deletedAt).toBe(trashed.deletedAt);
      const inTrash = await as(carol).get('/api/projects?status=DELETED').expect(200);
      expect(inTrash.body.items.map((p: { id: string }) => p.id)).toContain(projectId);

      expect((await setStatus('ACTIVE').expect(200)).body).toMatchObject({ status: 'ACTIVE', deletedAt: null });
    });

    it('validates the status and the owner', async () => {
      await setStatus('GONE').expect(400);
      await as(carol).patch(`/api/projects/${projectId}/status`).send({}).expect(400);
      await setStatus('DELETED', dave).expect(404);
    });
  });

  describe('duplicate', () => {
    let source: { id: string; slug: string };
    const canvas = {
      elements: [
        {
          id: 'logo',
          type: 'logo',
          panelId: 'front',
          x: 5,
          y: 5,
          width: 30,
          height: 30,
          rotation: 0,
          content: 'https://cdn.wrapfit.vn/logo.png',
        },
      ],
    };

    beforeAll(async () => {
      source = (
        await as(carol)
          .post('/api/projects')
          .send(
            newProject({
              templateId: 'lid-base',
              title: 'Hộp gốc',
              materialSpec: { type: 'duplex', gsm: 350, caliper: 0.45, finish: 'glossy' },
              canvasState: canvas,
              collectionId: carolCollection,
              tags: ['goc'],
            }),
          )
          .expect(201)
      ).body;
      await as(carol)
        .patch(`/api/projects/${source.id}`)
        .send({ thumbnailUrl: 'https://cdn.wrapfit.vn/thumbs/goc.png' })
        .expect(200);
    });

    it('creates an independent copy with a new id and slug', async () => {
      const res = await as(carol).post(`/api/projects/${source.id}/duplicate`).expect(201);

      expect(res.body.id).not.toBe(source.id);
      expect(res.body.slug).not.toBe(source.slug);
      expect(res.body).toMatchObject({
        title: '[Bản sao] Hộp gốc',
        status: 'ACTIVE',
        visibility: 'PRIVATE',
        template: { id: 'lid-base' },
        collection: { id: carolCollection },
        dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.45 },
        materialSpec: { type: 'duplex', gsm: 350, caliper: 0.45, finish: 'glossy' },
        canvasState: canvas,
        tags: ['goc'],
        thumbnailUrl: null,
        forkedFromId: null,
      });

      // Editing the copy leaves the source untouched.
      await as(carol).patch(`/api/projects/${res.body.id}`).send({ canvasState: { elements: [] } }).expect(200);
      expect((await as(carol).get(`/api/projects/${source.id}`).expect(200)).body.canvasState).toEqual(canvas);
    });

    it('refuses projects of other users and projects in the trash', async () => {
      await as(dave).post(`/api/projects/${source.id}/duplicate`).expect(404);

      await as(carol).patch(`/api/projects/${source.id}/status`).send({ status: 'DELETED' }).expect(200);
      await as(carol).post(`/api/projects/${source.id}/duplicate`).expect(409);
      await as(carol).patch(`/api/projects/${source.id}/status`).send({ status: 'ACTIVE' }).expect(200);
    });
  });

  describe('snapshots', () => {
    let projectId: string;
    let firstSnapshot: string;
    const text = (content: string) => ({
      elements: [{ id: 't', type: 'text', panelId: 'front', x: 4, y: 4, width: 40, height: 10, rotation: 0, content }],
    });
    const url = (path = '') => `/api/projects/${projectId}/snapshots${path}`;

    beforeAll(async () => {
      projectId = (
        await as(carol)
          .post('/api/projects')
          .send(newProject({ title: 'Hộp có lịch sử', canvasState: text('v1') }))
          .expect(201)
      ).body.id;
    });

    it('saves the current design as a named version', async () => {
      const res = await as(carol).post(url()).send({ name: '  Mốc 1: chữ v1  ' }).expect(201);
      expect(res.body).toEqual({
        id: expect.any(String),
        name: 'Mốc 1: chữ v1',
        previewUrl: null,
        dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.35 },
        createdAt: expect.any(String),
      });
      firstSnapshot = res.body.id;

      await as(carol).post(url()).send({ name: '' }).expect(400);
      await as(carol).post(url()).send({ name: 'x', canvasState: text('v2') }).expect(400);
    });

    it('restores a version and keeps the replaced state as an undo point', async () => {
      await as(carol)
        .patch(`/api/projects/${projectId}`)
        .send({ canvasState: text('v2'), dimensions: { length: 200, width: 100, height: 80 } })
        .expect(200);

      const res = await as(carol).post(url(`/${firstSnapshot}/restore`)).expect(200);
      expect(res.body.project).toMatchObject({
        id: projectId,
        canvasState: text('v1'),
        dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.35 },
      });
      expect(res.body.backup).toMatchObject({
        name: 'Trước khi khôi phục: Mốc 1: chữ v1',
        dimensions: { length: 200, width: 100, height: 80, paperThickness: 0.35 },
      });

      const history = (await as(carol).get(url()).expect(200)).body;
      expect(history.map((s: { name: string }) => s.name)).toEqual([
        'Trước khi khôi phục: Mốc 1: chữ v1',
        'Mốc 1: chữ v1',
      ]);
      expect(history[0].canvasState).toBeUndefined();

      // Undo the restore with the backup.
      const undo = await as(carol).post(url(`/${res.body.backup.id}/restore`)).expect(200);
      expect(undo.body.project.canvasState).toEqual(text('v2'));
    });

    it('deletes a version', async () => {
      await as(carol).delete(url(`/${firstSnapshot}`)).expect(204);
      await as(carol).delete(url(`/${firstSnapshot}`)).expect(404);
      await as(carol).post(url(`/${firstSnapshot}/restore`)).expect(404);
      await as(carol).delete(url('/not-a-uuid')).expect(400);
    });

    it('hides the history from other users and freezes it in the trash', async () => {
      await as(dave).get(url()).expect(404);
      await as(dave).post(url()).send({ name: 'x' }).expect(404);

      await as(carol).patch(`/api/projects/${projectId}/status`).send({ status: 'DELETED' }).expect(200);
      await as(carol).post(url()).send({ name: 'x' }).expect(409);
      await as(carol).get(url()).expect(200);
    });
  });

  describe('trash purge (cron)', () => {
    it('is scheduled every day at 02:00', () => {
      const job = app.get(SchedulerRegistry).getCronJob('trash-purge');
      expect(job.cronTime.source).toBe('0 2 * * *');
    });

    it('permanently deletes projects that stayed in the trash for more than 30 days', async () => {
      const create = async (title: string) =>
        (await as(carol).post('/api/projects').send(newProject({ title })).expect(201)).body.id as string;
      const expired = await create('Hết hạn');
      const recent = await create('Mới vào thùng rác');
      const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      for (const id of [expired, recent]) {
        await as(carol).patch(`/api/projects/${id}/status`).send({ status: 'DELETED' }).expect(200);
      }
      await as(carol).post(`/api/projects/${expired}/snapshots`).send({ name: 'x' }).expect(409); // trash is read-only
      await prisma.projectSnapshot.create({
        data: { projectId: expired, name: 'old', canvasState: { elements: [] }, dimensions: {} },
      });
      // Simulate the passage of time.
      await prisma.packagingProject.update({ where: { id: expired }, data: { deletedAt: daysAgo(31) } });
      await prisma.packagingProject.update({ where: { id: recent }, data: { deletedAt: daysAgo(29) } });

      await app.get(TrashPurgeTask).run();

      expect(await prisma.packagingProject.findUnique({ where: { id: expired } })).toBeNull();
      expect(await prisma.projectSnapshot.count({ where: { projectId: expired } })).toBe(0);
      expect(await prisma.packagingProject.findUnique({ where: { id: recent } })).not.toBeNull();
    });
  });
});
