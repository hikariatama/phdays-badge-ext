import { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

type Color = [number, number, number];
type Grid = Color[][];

const disconnectedFrames = [
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      68,
      73,
      247
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      68,
      74,
      247
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      255,
      255,
      254
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      255,
      254,
      254
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      254,
      254,
      255
    ],
    [
      254,
      254,
      254
    ],
    [
      255,
      255,
      255
    ],
    [
      254,
      255,
      254
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      255,
      254,
      254
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      254,
      254,
      255
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ]
  ],
  [
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ],
    [
      0,
      0,
      0
    ]
  ]
]

interface FrameGenerator {
  init?(setLoadingProgress: (percentage: number) => void): Promise<void>;
  frameCount: number;
  fps: number;
  generate(t: number): Grid;
}

class SwirlGenerator implements FrameGenerator {
  frameCount = 100;
  fps = 60;
  generate(t: number): Grid {
    function hsvToRgb(h: number, s: number, v: number): Color {
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = Math.round(255 * v * (1 - s));
      const q = Math.round(255 * v * (1 - f * s));
      const t2 = Math.round(255 * v * (1 - (1 - f) * s));
      const v2 = Math.round(255 * v);
      switch (i % 6) {
        case 0: return [v2, t2, p];
        case 1: return [q, v2, p];
        case 2: return [p, v2, t2];
        case 3: return [p, q, v2];
        case 4: return [t2, p, v2];
        default: return [v2, p, q];
      }
    }
    const grid: Grid = [];
    const cx = 5, cy = 5;
    const maxRadius = Math.hypot(cx, cy);
    for (let y = 0; y < 10; y++) {
      const row: Color[] = [];
      for (let x = 0; x < 10; x++) {
        const dx = x - cx, dy = y - cy;
        const angle = (Math.atan2(dy, dx) + Math.PI + 2 * Math.PI * t / this.frameCount) % (2 * Math.PI);
        const radius = Math.hypot(dx, dy) / maxRadius;
        const hue = (angle / (2 * Math.PI) + radius) % 1;
        row.push(hsvToRgb(hue, 1, 1));
      }
      grid.push(row);
    }
    return grid;
  }
}
class RunningTextGenerator implements FrameGenerator {
  frameCount: number;
  fps = 15;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private charWidths: number[];
  private scrollWidth: number;

  constructor(text: string, fg: Color, bg: Color) {
    const letterSpacing = 2;
    this.canvas = document.createElement('canvas');
    this.canvas.height = 10;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.font = '10px CustomFont';

    this.charWidths = Array.from(text).map(c => {
      const m = this.ctx.measureText(c);
      return (m.actualBoundingBoxRight !== undefined && m.actualBoundingBoxLeft !== undefined)
        ? m.actualBoundingBoxRight - m.actualBoundingBoxLeft
        : m.width;
    });

    const textWidth = this.charWidths.reduce((a, b) => a + b, 0) + Math.max(0, text.length - 1) * letterSpacing;
    this.scrollWidth = Math.round(20 + textWidth);
    this.canvas.width = this.scrollWidth;
    this.frameCount = Math.max(1, Math.round(this.scrollWidth - 9));

    this.ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
    this.ctx.fillRect(0, 0, this.canvas.width, 10);

    this.ctx.font = '10px CustomFont';
    this.ctx.textBaseline = 'alphabetic';
    const metrics = this.ctx.measureText('M');
    const ascent = metrics.actualBoundingBoxAscent || 8;
    const descent = metrics.actualBoundingBoxDescent || 2;
    const yOffset = Math.floor((10 - (ascent + descent - 4)) / 2) + ascent;

    let x = 10;
    for (let i = 0; i < text.length; i++) {
      this.ctx.fillStyle = `rgb(${fg[0]},${fg[1]},${fg[2]})`;
      this.ctx.fillText(text[i], x, yOffset);
      x += this.charWidths[i] + letterSpacing;
    }
  }

  generate(t: number): Grid {
    const imgData = this.ctx.getImageData(t, 0, 10, 10).data;
    const grid: Grid = [];
    for (let y = 0; y < 10; y++) {
      const row: Color[] = [];
      for (let x = 0; x < 10; x++) {
        const idx = (y * 10 + x) * 4;
        row.push([imgData[idx], imgData[idx + 1], imgData[idx + 2]]);
      }
      grid.push(row);
    }
    return grid;
  }
}

class PhotoGenerator implements FrameGenerator {
  frameCount = 1;
  fps = 1;
  private grid: Grid;
  private file: File;

  constructor(file: File) {
    this.grid = [];
    this.file = file;
  }

  async init(setLoadingProgress: (percentage: number) => void): Promise<void> {
    setLoadingProgress(-1);
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d')!;
    await new Promise<void>((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        for (let y = 0; y < 10; y++) {
          const row: Color[] = [];
          for (let x = 0; x < 10; x++) {
            const i = (y * 10 + x) * 4;
            row.push([data[i], data[i + 1], data[i + 2]]);
          }
          this.grid.push(row);
        }
        resolve();
      };
      img.src = URL.createObjectURL(this.file);
    })
    setLoadingProgress(0);
  }

  generate(): Grid {
    console.log(this.grid)
    return this.grid;
  }
}

export class VideoFrameGenerator implements FrameGenerator {
  private gridList: Grid[] = [];
  frameCount = 0;
  fps = 30;
  private ffmpeg = new FFmpeg();

  private file: File;
  constructor(file: File) {
    this.file = file;
  }

  async init(setLoadingProgress: (percentage: number) => void): Promise<void> {
    if (!this.ffmpeg.loaded) await this.ffmpeg.load();
    this.ffmpeg.createDir('/frames');
    const name = '/frames/input.mp4';
    const framePattern = '/frames/frame_%04d.png';

    setLoadingProgress(-1);

    this.ffmpeg.writeFile(name, await fetchFile(this.file));

    console.log("Extracting frames from video", this.file.name);

    this.ffmpeg.on("log", (message) => {
      console.log("[ffmpeg]", message.message);
    })

    const result = await this.ffmpeg.exec([
      '-i', name,
      '-vf', `fps=${this.fps},crop=ih:ih,scale=10:10`,
      framePattern
    ]);
    console.log(result);

    const files = (await this.ffmpeg.listDir('/frames')).filter(file => file.name.endsWith('.png')).sort();

    console.log("Extracted frames:", files);

    this.frameCount = files.length;

    for (let i = 0; i < files.length; i++) {
      console.log(`Processing frame ${i + 1}/${files.length}: ${files[i].name}`);
      const file = files[i];
      const data = await this.ffmpeg.readFile(`/frames/${file.name}`);
      const imageBitmap = await createImageBitmap(new Blob([data], { type: 'image/png' }));
      const canvas = new OffscreenCanvas(10, 10);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(imageBitmap, 0, 0);

      const imgData = ctx.getImageData(0, 0, 10, 10).data;
      const grid: Grid = [];

      for (let y = 0; y < 10; y++) {
        const row: Color[] = [];
        for (let x = 0; x < 10; x++) {
          const idx = (y * 10 + x) * 4;
          row.push([imgData[idx], imgData[idx + 1], imgData[idx + 2]]);
        }
        grid.push(row);
      }

      this.gridList.push(grid);
      setLoadingProgress(Math.round((i + 1) / files.length * 100));
    }

    setLoadingProgress(0);
  }

  generate(t: number): Grid {
    return this.gridList[t];
  }
}



export default function Page() {
  const [choice, setChoiceInternal] = useState<string>('1');
  const [text, setTextInternal] = useState<string>('PHDAYS');
  const [fg, setFgInternal] = useState<string>('#ffffff');
  const [bg, setBgInternal] = useState<string>('#000000');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [generator, setGenerator] = useState<FrameGenerator | null>(null);
  const [frames, setFrames] = useState<Grid[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const intervalRef = useRef<number | undefined>(undefined);
  const [badgeColor, setBadgeColor] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [badgeConnected, setBadgeConnected] = useState<boolean>(false);

  useEffect(() => {
    let inProgress = false;
    async function checkConnection() {
      if (inProgress) return;
      inProgress = true;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('http://192.168.4.1/api/v1/projects', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
          redirect: 'manual',
        });
        clearTimeout(timeout);
        setBadgeConnected(res.status === 200);
      } catch {
        setBadgeConnected(false);
      } finally {
        inProgress = false;
      }
    }
    checkConnection();
    const interval = window.setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  const setChoice = (value: string) => {
    window.localStorage.setItem('choice', value);
    setChoiceInternal(value);
  };

  useEffect(() => {
    const storedChoice = window.localStorage.getItem('choice');
    if (storedChoice) {
      setChoiceInternal(storedChoice);
    }
  }, []);

  const setText = (value: string) => {
    window.localStorage.setItem('text', value);
    setTextInternal(value);
  };

  useEffect(() => {
    const storedText = window.localStorage.getItem('text');
    if (storedText) {
      setTextInternal(storedText);
    }
  }, []);

  const setFg = (value: string) => {
    window.localStorage.setItem('fg', value);
    setFgInternal(value);
  };

  useEffect(() => {
    const storedFg = window.localStorage.getItem('fg');
    if (storedFg) {
      setFgInternal(storedFg);
    }
  }, []);

  const setBg = (value: string) => {
    window.localStorage.setItem('bg', value);
    setBgInternal(value);
  };

  useEffect(() => {
    const storedBg = window.localStorage.getItem('bg');
    if (storedBg) {
      setBgInternal(storedBg);
    }
  }, []);

  useEffect(() => {
    const fontFace = new FontFace('CustomFont', 'url(font.otf)');
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
      console.log('Font loaded');
    });
  }, []);

  function hexToRgb(hex: string): Color {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  const loadGenerator = useCallback(async () => {
    console.log('Loading generator', choice, text, fg, bg, photoFile, videoFile);
    let gen: FrameGenerator;
    if (choice === '1') gen = new SwirlGenerator();
    else if (choice === '2') gen = new RunningTextGenerator(text, hexToRgb(fg), hexToRgb(bg));
    else if (choice === '3') {
      if (!photoFile) return;
      const fg = new PhotoGenerator(photoFile);
      await fg.init(setLoadingProgress);
      gen = fg;
    } else {
      if (!videoFile) return;
      const vg = new VideoFrameGenerator(videoFile);
      await vg.init(setLoadingProgress);
      gen = vg;
    }
    setGenerator(gen);
    const total = gen.frameCount;
    const list: Grid[] = [];
    for (let i = 0; i < total; i++) list.push(gen.generate(i));
    setFrames(list);
    setPreviewIndex(0);

    function startPreview() {
      if (!gen) return;
      const fps = gen.fps;
      stopPreview();
      intervalRef.current = window.setInterval(() => {
        setPreviewIndex(i => (i + 1) % list.length);
      }, 1000 / fps);
    }

    setTimeout(() => startPreview(), 0);
  }, [choice, text, fg, bg, photoFile, videoFile]);

  useEffect(() => {
    loadGenerator();
  }, [loadGenerator, choice, text, fg, bg, photoFile, videoFile]);

  function stopPreview() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function gridsToBinary(grids: Grid[], fps: number): Uint8Array {
    const delay = Math.round(1000 / fps);
    const bytes: number[] = [];
    grids.forEach(grid => {
      bytes.push((delay >> 8) & 0xff, delay & 0xff);
      grid.forEach(row => row.forEach(([r, g, b]) => bytes.push(r, g, b)));
    });
    return new Uint8Array(bytes);
  }

  async function sendToBadge() {
    if (!generator) return;
    const fps = generator.fps;
    const data = gridsToBinary(frames, fps);
    try {
      await fetch('http://192.168.4.1/api/v1/led/picture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: data
      });
    } catch (e) {
      console.error('Error sending data to badge', e);
    }
    setPreviewIndex(0);
  }

  return (
    <div className="min-h-screen w-screen bg-[#111] flex items-center justify-center font-sans text-white gap-16 flex-col md:flex-row px-4 md:px-0">
      <div className="rounded-2xl p-8 min-w-[320px] flex flex-col gap-6 bg-gradient-to-br from-[#111214] to-[#0c0d0f] border-t border-r border-l border-white/5 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1),0_2px_40px_10px_rgba(154,170,255,0.05),0_0_16px_-7px_rgba(154,170,255,0.05)] w-full md:w-auto">
        <div>
          <label className="font-semibold text-lg mb-2 block">Mode</label>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              className={`cursor-pointer flex-1 px-3 py-2 rounded-lg border outline-none transition ${choice === '1'
                ? 'bg-lime-600 text-white border-lime-600'
                : 'bg-[#232526] text-white border-[#444] hover:bg-[#282a2c]'
                }`}
              onClick={() => setChoice('1')}
            >
              Swirl
            </button>
            <button
              type="button"
              className={`cursor-pointer flex-1 px-3 py-2 rounded-lg border outline-none transition ${choice === '2'
                ? 'bg-lime-600 text-white border-lime-600'
                : 'bg-[#232526] text-white border-[#444] hover:bg-[#282a2c]'
                }`}
              onClick={() => setChoice('2')}
            >
              Scrolling&nbsp;Text
            </button>
            <button
              type="button"
              className={`cursor-pointer flex-1 px-3 py-2 rounded-lg border outline-none transition ${choice === '3'
                ? 'bg-lime-600 text-white border-lime-600'
                : 'bg-[#232526] text-white border-[#444] hover:bg-[#282a2c]'
                }`}
              onClick={() => setChoice('3')}
            >
              Photo
            </button>
            <button
              type="button"
              className={`cursor-pointer flex-1 px-3 py-2 rounded-lg border outline-none transition ${choice === '4'
                ? 'bg-lime-600 text-white border-lime-600'
                : 'bg-[#232526] text-white border-[#444] hover:bg-[#282a2c]'
                }`}
              onClick={() => setChoice('4')}
            >
              Video
            </button>
          </div>
        </div>
        {choice === '2' && (
          <div className="flex flex-col gap-3">
            <label className="font-medium">Text</label>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Text"
              className="px-3 py-2 rounded-lg border border-[#444] bg-[#232526] text-white text-base outline-none"
            />
            <div className="flex gap-3">
              <div>
                <label className="text-xs font-medium">Foreground</label>
                <div
                  className="inline-block ml-2 w-4 h-4 rounded-full border border-white/30 cursor-pointer align-middle"
                  style={{ backgroundColor: fg }}
                  onClick={() => {
                    const input = document.getElementById('fg-color-input');
                    if (input) (input as HTMLInputElement).click();
                  }}
                  title="Change text color"
                />
                <input
                  id="fg-color-input"
                  type="color"
                  value={fg}
                  onChange={e => setFg(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Background</label>
                <div
                  className="inline-block ml-2 w-4 h-4 rounded-full border border-white/30 cursor-pointer align-middle"
                  style={{ backgroundColor: bg }}
                  onClick={() => {
                    const input = document.getElementById('bg-color-input');
                    if (input) (input as HTMLInputElement).click();
                  }}
                  title="Change background color"
                />
                <input
                  id="bg-color-input"
                  type="color"
                  value={bg}
                  onChange={e => setBg(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>
        )}
        {choice === '3' && (
          <div
            className="flex flex-col gap-1"
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setPhotoFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <label className="font-medium">Photo</label>
            <label
              htmlFor="photo-upload"
              className="mt-2 flex items-center justify-center border border-dashed border-[#444] rounded-lg py-6 bg-[#232526] text-white cursor-pointer transition hover:bg-[#282a2c] text-center"
              style={{ minHeight: 80 }}
            >
              {photoFile ? (
                <span className="truncate w-full px-4">{photoFile.name}</span>
              ) : (
                <span>Select the photo or drop it here</span>
              )}
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={e => setPhotoFile(e.target.files![0])}
              className="hidden"
            />
          </div>
        )}
        {choice === '4' && (
          <div
            className="flex flex-col gap-1"
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setVideoFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <label className="font-medium">Video</label>
            <label
              htmlFor="video-upload"
              className="mt-2 flex items-center justify-center border border-dashed border-[#444] rounded-lg py-6 bg-[#232526] text-white cursor-pointer transition hover:bg-[#282a2c] text-center"
              style={{ minHeight: 80 }}
            >
              {videoFile ? (
                <span className="truncate w-full px-4">{videoFile.name}</span>
              ) : (
                <span>Select the video or drop it here</span>
              )}
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={e => setVideoFile(e.target.files![0])}
              className="hidden"
            />
          </div>
        )}
        {loadingProgress > 0 && loadingProgress < 100 && (
          <div className="w-full flex flex-col gap-1">
            <div className="text-xs text-white/70 font-medium">Loading: {loadingProgress}%</div>
            <div className="w-full h-2 bg-[#222] rounded">
              <div
                className="h-2 bg-blue-500 rounded transition-all"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}
        {loadingProgress === -1 && (
          <div className="w-full flex flex-col gap-1 items-center">
            <div className="text-xs text-white/70 font-medium mb-1">Doing ffmpeg magic...</div>
            <div className="w-full h-2 bg-[#222] rounded overflow-hidden relative">
              <div
                className="absolute h-2 bg-blue-500 rounded"
                style={{
                  width: '30%',
                  left: 0,
                  animation: 'bounce-loading 1.2s cubic-bezier(.4,0,.2,1) infinite'
                }}
              />
            </div>
            <style>{`
              @keyframes bounce-loading {
              0% { left: 0; }
              50% { left: 70%; }
              100% { left: 0; }
              }
            `}</style>
          </div>
        )}
        <button
          onClick={sendToBadge}
          disabled={!badgeConnected}
          className={`flex flex-row gap-2 items-center justify-center min-h-9 px-3 py-2 text-sm font-medium font-inter leading-4 tracking-wide whitespace-nowrap border-none rounded-lg transition
            active:shadow-[inset_0_-1px_0.4px_0_rgba(0,0,0,0.2),inset_0_1px_0.4px_0_#fff,0_0_0_2px_rgba(0,0,0,0.5),0_0_14px_0_hsla(0,0%,100%,0.19)]
            hover:shadow-[inset_0_-1px_0.4px_0_rgba(0,0,0,0.2),inset_0_1px_0.4px_0_#fff,0_0_0_2px_rgba(0,0,0,0.5),0_0_14px_0_hsla(0,0%,100%,0.19)]
            hover:bg-white
            disabled:shadow-none disabled:bg-neutral-400 disabled:text-neutral-600 disabled:cursor-not-allowed
            bg-[#E6E6E6] text-[#2F3031] shadow-[0_0_0_2px_rgba(0,0,0,0.5),0_0_14px_0_rgba(255,255,255,0.19),inset_0_-1px_0.4px_0_rgba(0,0,0,0.2),inset_0_1px_0.4px_0_white]
            cursor-pointer`}
        >
          Send to Badge
        </button>
      </div>
      <div
        className="relative cursor-pointer"
        style={{
          backgroundImage: badgeColor ? 'url(/badge_white.png)' : 'url(/badge_red.png)',
          width: 229,
          height: 342,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: badgeConnected ? 'none' : 'grayscale(1) brightness(0.5)',
        }}
        onClick={() => setBadgeColor(!badgeColor)}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(10, 13.5px)',
            gridTemplateRows: 'repeat(10, 13.5px)',
            gap: 3,
            background: '#000',
            width: 'fit-content',
            marginTop: 84,
            marginLeft: 20,
            padding: 4,
            paddingTop: 5.5,
            paddingBottom: 5.5,
            transform: 'skewX(-5.976deg)',
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          }}
        >
          {(!badgeConnected || frames.length > 0 && frames[previewIndex]) && (badgeConnected ? frames[previewIndex] : disconnectedFrames).flat().map((pixel, i) => (
            <div
              key={i}
              className="rounded bg-black transition"
              style={{
                width: 13.5,
                height: 13.5,
                borderRadius: 4,
                backgroundImage: `
                radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.3) 100%),
                linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))
              `,
                backgroundColor: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`,
                backgroundBlendMode: 'overlay, darken',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                transition: 'background 0.02s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
