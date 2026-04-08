# Jobinator — frontend rules

## Design system
- Fonts: Playfair Display (display/H1), Geist Sans (UI/body). Never Inter, Roboto, Arial.
- Colors: bg `#F8F6F1`, text `#1A1A18`, accent `#1E4D3B`. No blue/purple gradients.
- Cards: `1px solid #E8E5DF`, `border-radius: 12px`, no drop shadows.
- Icons: Lucide-react only. Never emoji in UI.
- Spacing: 48px+ between major sections. Nothing cramped.
- Mobile-first. Test all views at 375px.

## Tone
- Audience: students aged 16–22.
- Tone: warm, direct, smart. Not corporate. Not patronising.
- Use `[COPY NEEDED]` for marketing text. Never lorem ipsum.

## Components
- shadcn/ui for all interactive elements.
- Tailwind utility classes only, no inline styles unless unavoidable.
- CSS transitions only. No animation libraries.
