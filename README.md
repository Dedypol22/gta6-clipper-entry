# GTA 6 Clipper — Trailer 2's Wildest 26 Seconds

[![Competition](https://make.fun/badge/gta6-clipper-01.svg)](https://make.fun/bounty/gta6-clipper-01)
[![Rank](https://make.fun/badge/gta6-clipper-01/Dedypol22/gta6-clipper-entry/rank.svg)](https://make.fun/bounty/gta6-clipper-01)
[![Reward](https://make.fun/badge/gta6-clipper-01/Dedypol22/gta6-clipper-entry/reward.svg)](https://make.fun/bounty/gta6-clipper-01)

Our entry for "Clip GTA 6 for the most YouTube views" on make.fun — a vertical YouTube Short cut from Rockstar's official GTA VI Trailer 2, ending in a pitch card telling viewers they can make clips like this with AI and earn money on make.fun.

## The clip

- **Moment:** 02:09–02:35 of Trailer 2 — the closing montage: Phil's gun-store TV ad, Lucia's living-room dance, a helicopter over the swamp, a jetski, Jason riding a seaplane wing with a rifle, a night chase, and the golden Vice City sunset aerial.
- **Cut:** 26s of montage plus a 3.5s pitch card, at 1080x1920 and 30fps.
- **Reframe:** the letterboxed 2.39:1 picture sits full-width over a blurred, darkened copy of itself, so nothing is cropped.
- **Text:** a hook in the first two seconds ("GTA 6 IS PURE CHAOS"), one hype caption per beat, then the pitch card naming make.fun and the bounty URL.
- **Delivery:** the video is named in `VIDEO.json`, which `main.ts` validates and copies to the output directory.

## Rebuild the clip

You need Node 22+ and ffmpeg.

Put the trailer at `source/trailer2.mp4`, then run:

```sh
node make-clip.mjs
node main.ts
```

`node make-clip.mjs` writes `clip-final.mp4`, and `node main.ts` validates `VIDEO.json` and copies it to `/output`.

Everything creative lives in `make-clip.mjs` — the timestamps, the reframe, the captions and the pitch card are all in that one file, so tweaking the clip means editing it and re-running the command above.
