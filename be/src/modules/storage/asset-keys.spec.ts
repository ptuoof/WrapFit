import {
  assetUrl,
  configureAssetBase,
  storedCanvasKeys,
  toClientBrandKit,
  toClientCanvas,
  toStoredCanvas,
  uploadKeyOf,
} from './asset-keys';

describe('asset keys', () => {
  const key = 'users/0192a4c0-0000-7000-8000-000000000001/image/0192a4c0-0000-7000-8000-0000000000aa.png';
  const element = (type: string, content: string) => ({ id: type, type, panelId: 'front', content });

  beforeEach(() => configureAssetBase('https://cdn.wrapfit.vn/'));
  afterAll(() => configureAssetBase(''));

  it('turns upload URLs into keys whatever the scheme, query or fragment', () => {
    expect(uploadKeyOf(`https://cdn.wrapfit.vn/${key}`)).toBe(key);
    expect(uploadKeyOf(`http://cdn.wrapfit.vn/${key}?v=2#x`)).toBe(key);
    expect(uploadKeyOf(`https://other.example/${key}`)).toBeNull();
    expect(uploadKeyOf('https://cdn.wrapfit.vn/projects/p-1/unboxing/qr-abc.png')).toBeNull(); // not an upload
    expect(uploadKeyOf('/branding/wrapfit-logo.png')).toBeNull();
  });

  it('builds URLs only while storage is enabled', () => {
    expect(assetUrl(key)).toBe(`https://cdn.wrapfit.vn/${key}`);
    expect(assetUrl(null)).toBeNull();
    configureAssetBase('');
    expect(assetUrl(key)).toBeNull();
    expect(uploadKeyOf(`https://cdn.wrapfit.vn/${key}`)).toBeNull();
  });

  it('stores canvas uploads as keys and returns them as URLs; other contents are kept as sent', () => {
    const client = {
      elements: [
        element('image', `https://cdn.wrapfit.vn/${key}`),
        element('logo', '/branding/wrapfit-logo.png'),
        element('pattern', 'https://images.example/pattern.svg'),
        element('text', `https://cdn.wrapfit.vn/${key}`), // text is never a file
      ],
      backgroundTheme: 'earthy_olive',
    };
    const stored = toStoredCanvas(client);
    expect(stored.elements.map((e) => e.content)).toEqual([
      key,
      '/branding/wrapfit-logo.png',
      'https://images.example/pattern.svg',
      `https://cdn.wrapfit.vn/${key}`,
    ]);
    expect(stored.backgroundTheme).toBe('earthy_olive');
    expect(toStoredCanvas(stored)).toEqual(stored); // idempotent
    expect(storedCanvasKeys(stored)).toEqual([key]);
    expect(toClientCanvas(stored)).toEqual(client);
  });

  it('returns the brand kit logo as a URL, and leaves kits saved before keys untouched', () => {
    expect(toClientBrandKit({ logoKey: key, colors: ['#111111'] })).toEqual({
      logoUrl: `https://cdn.wrapfit.vn/${key}`,
      colors: ['#111111'],
    });
    expect(toClientBrandKit({ logoKey: null, colors: [] })).toEqual({ logoUrl: null, colors: [] });
    expect(toClientBrandKit(null)).toBeNull();
  });
});
