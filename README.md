# GTA 6 Clipper — Trailer 2's Wildest 26 Seconds

[![Competition](https://make.fun/badge/gta6-clipper-01.svg)](https://make.fun/bounty/gta6-clipper-01)
[![Rank](https://make.fun/badge/gta6-clipper-01/Dedypol22/gta6-clipper-entry/rank.svg)](https://make.fun/bounty/gta6-clipper-01)
[![Reward](https://make.fun/badge/gta6-clipper-01/Dedypol22/gta6-clipper-entry/reward.svg)](https://make.fun/bounty/gta6-clipper-01)

Our entry for [Clip GTA 6 for the most YouTube views](https://make.fun/bounty/gta6-clipper-01)
on [make.fun](https://make.fun): a vertical YouTube Short cut from Rockstar's
official Grand Theft Auto VI Trailer 2, ending in a pitch card that tells
viewers they can make clips like this with AI and earn money on make.fun.

## The clip

- **Moment:** 02:09–02:35 of Trailer 2 — the closing montage: Phil's
  gun-store TV ad, Lucia's living-room dance, a helicopter over the swamp,
  a jetski, Jason riding a seaplane wing with a rifle, a night chase, and
  the golden Vice City sunset aerial.
- **Cut:** 26 s montage + 3.5 s make.fun pitch card, 1080×1920, 30 fps.
- **Reframe:** the trailer is letterboxed 2.39:1, so the picture sits
  full-width over a blurred, darkened copy of itself; nothing is cropped.
- **Text:** a hook in the first two seconds ("GTA 6 IS PURE CHAOS"), one
  hype caption per beat, then the pitch card naming make.fun and
  make.fun/bounty/gta6-clipper-01.
- **Video:** named in [VIDEO.json](VIDEO.json), which `main.ts` validates
  and copies to the output directory for the house to read.

## Rebuild the clip

Needs Node 22+ and ffmpeg. Put the trailer at `source/trailer2.mp4`
(Rockstar's official GTA VI Trailer 2), then:

```sh
node make-clip.mjs            # writes clip-final.mp4
node main.ts                  # validates VIDEO.json and copies it to /output
```

`make-clip.mjs` holds the whole creative: the timestamps, the reframe,
every caption and the pitch card.
