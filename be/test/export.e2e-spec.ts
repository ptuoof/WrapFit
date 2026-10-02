import { INestApplication, INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { WorkerModule } from '../src/worker';

/**
 * Print export (IT3-11): API enqueues in Redis, a real worker context renders and uploads to SeaweedFS.
 * Needs `docker compose up -d postgres redis seaweedfs storage-init`.
 */
describe('Print export (e2e)', () => {
  let app: INestApplication;
  let worker: INestApplicationContext;
  let prisma: PrismaService;

  const run = Date.now();
  let pia: { cookie: string };
  let quinn: { cookie: string };
  let projectId: string;

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

  /** Polls like the frontend does (docs 07: every 2 s; faster here). */
  const waitFor = async (jobId: string) => {
    for (let i = 0; i < 100; i++) {
      const res = await as(pia).get(`/api/exports/${jobId}`).expect(200);
      if (res.body.status === 'COMPLETED' || res.body.status === 'FAILED') return res.body;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Export ${jobId} did not finish`);
  };
  const exportAs = async (fileType: string) => {
    const res = await as(pia).post(`/api/projects/${projectId}/exports`).send({ fileType }).expect(202);
    expect(res.body).toMatchObject({ jobId: expect.any(String), status: 'PENDING', fitCheck: { isValidForProduction: true } });
    return waitFor(res.body.jobId);
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    const workerRef = await Test.createTestingModule({ imports: [WorkerModule] }).compile();
    worker = await workerRef.createNestApplication().init();

    pia = await register('pia');
    quinn = await register('quinn');
    projectId = (
      await as(pia)
        .post('/api/projects')
        .send({
          templateId: 'tuck-top',
          title: 'Hộp nến Tết',
          dimensions: { length: 120, width: 80, height: 60 },
          canvasState: {
            elements: [
              { id: 't1', type: 'text', panelId: 'panel_front', x: 10, y: 10, width: 60, height: 10, rotation: 0, content: 'An khang thịnh vượng' },
            ],
          },
        })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { endsWith: '@e2e.test' } } });
    await worker.close();
    await app.close();
  });

  it('renders a CMYK PDF in the worker and returns a 15-minute download link', async () => {
    const job = await exportAs('PDF_CMYK');
    expect(job).toMatchObject({
      status: 'COMPLETED',
      fileType: 'PDF_CMYK',
      error: null,
      fileName: 'hop-nen-tet-pdf-cmyk.pdf',
      downloadExpiresIn: 900,
    });
    const url = new URL(job.downloadUrl);
    expect(url.searchParams.get('X-Amz-Expires')).toBe('900');

    const file = await fetch(job.downloadUrl);
    expect(file.status).toBe(200);
    expect(file.headers.get('content-disposition')).toBe('attachment; filename="hop-nen-tet-pdf-cmyk.pdf"');
    const pdf = Buffer.from(await file.arrayBuffer());
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.toString('latin1')).toContain('BeVietnamPro');
  });

  it('renders SVG and DXF too', async () => {
    const svg = await exportAs('SVG');
    const svgText = await (await fetch(svg.downloadUrl)).text();
    expect(svgText).toContain('<g id="crease"');
    expect(svgText).toContain('An khang thịnh vượng');

    const dxf = await exportAs('DXF');
    expect(await (await fetch(dxf.downloadUrl)).text()).toMatch(/^0\nSECTION\n2\nHEADER/);
  });

  it('keeps a snapshot of each export and lists the history', async () => {
    const snapshots = (await as(pia).get(`/api/projects/${projectId}/snapshots`).expect(200)).body;
    expect(snapshots.map((s: { name: string }) => s.name)).toEqual(
      expect.arrayContaining([expect.stringMatching(/^Bản xuất in PDF_CMYK /), expect.stringMatching(/^Bản xuất in DXF /)]),
    );
    const history = (await as(pia).get(`/api/projects/${projectId}/exports`).expect(200)).body;
    expect(history.map((j: { fileType: string }) => j.fileType)).toEqual(['DXF', 'SVG', 'PDF_CMYK']);
  });

  it('blocks the export when the server-side FitCheck finds errors', async () => {
    await as(pia)
      .patch(`/api/projects/${projectId}`)
      .send({
        canvasState: {
          elements: [
            // 0.5 mm from the panel edge: would be cut off when folding.
            { id: 'logo', type: 'logo', panelId: 'panel_front', x: 0.5, y: 0.5, width: 20, height: 20, rotation: 0, content: 'https://cdn.wrapfit.vn/logo.png' },
          ],
        },
      })
      .expect(200);
    const res = await as(pia).post(`/api/projects/${projectId}/exports`).send({ fileType: 'PDF_CMYK' }).expect(422);
    expect(res.body.message).toBe('FitCheck found errors that would ruin the print; fix them before exporting');
    expect(res.body.fitCheck).toMatchObject({ isValidForProduction: false, violations: [expect.objectContaining({ code: 'CREASE_OVERLAP', severity: 'error' })] });

    // The server result is saved on the project for the editor.
    const project = (await as(pia).get(`/api/projects/${projectId}`).expect(200)).body;
    expect(project.fitcheckState).toMatchObject({ isValidForProduction: false });
  });

  it('validates the request and hides exports from other users', async () => {
    await as(pia).post(`/api/projects/${projectId}/exports`).send({ fileType: 'JPG' }).expect(400);
    await as(quinn).post(`/api/projects/${projectId}/exports`).send({ fileType: 'SVG' }).expect(404);
    const [latest] = (await as(pia).get(`/api/projects/${projectId}/exports`).expect(200)).body;
    await as(quinn).get(`/api/exports/${latest.id}`).expect(404);
    await as(pia).get('/api/exports/not-a-uuid').expect(400);
    await api().get(`/api/exports/${latest.id}`).expect(401);
  });

  it('deletes the exported files with the project', async () => {
    const [latest] = (await as(pia).get(`/api/projects/${projectId}/exports`).expect(200)).body;
    const key = `projects/${projectId}/exports/${latest.id}.dxf`;
    expect((await fetch(`http://localhost:8333/wrapfit/${key}`)).status).toBe(200);

    await as(pia).patch(`/api/projects/${projectId}/status`).send({ status: 'DELETED' }).expect(200);
    await as(pia).delete(`/api/projects/${projectId}`).expect(204);
    expect((await fetch(`http://localhost:8333/wrapfit/${key}`)).status).toBe(404);
  });
});
