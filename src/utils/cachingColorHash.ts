import ColorHash from 'color-hash';

class CachingColorHash {
  private cache: Record<string, string> = {};
  private instance: ColorHash;
  constructor(opts?: object) {
    let colorHashOptions = {
      lightness: 0.4,
      saturation: 0.4,
    };
    if (opts) {
      colorHashOptions = {
        ...colorHashOptions,
        ...opts,
      };
    }
    this.instance = new ColorHash(colorHashOptions);
  }
  calculateColor(str: string): string {
    if (!this.cache[str]) {
      const colorAsHex = this.instance.hex(str);
      this.cache[str] = colorAsHex;
    }

    return this.cache[str];
  }
}

export default CachingColorHash;
