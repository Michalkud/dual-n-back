# Audio Files for Dual N-Back Game

This directory contains MP3 audio files used by the game.

## Required Files

### Letter Audio Files
Place in `/audio/letters/`:
- `a_low.mp3`, `a_med.mp3`, `a_high.mp3`
- `b_low.mp3`, `b_med.mp3`, `b_high.mp3`
- `c_low.mp3`, `c_med.mp3`, `c_high.mp3`
- `d_low.mp3`, `d_med.mp3`, `d_high.mp3`
- `e_low.mp3`, `e_med.mp3`, `e_high.mp3`
- `f_low.mp3`, `f_med.mp3`, `f_high.mp3`
- `g_low.mp3`, `g_med.mp3`, `g_high.mp3`
- `h_low.mp3`, `h_med.mp3`, `h_high.mp3`
- `i_low.mp3`, `i_med.mp3`, `i_high.mp3`

### Feedback Audio Files
Place in `/audio/feedback/`:
- `correct.mp3` - Played when user makes correct response
- `incorrect.mp3` - Played when user makes incorrect response

## Pitch Variations
- **Low**: Lower pitch version of the letter
- **Med**: Normal pitch version of the letter  
- **High**: Higher pitch version of the letter

## Audio Specifications
- Format: MP3
- Sample Rate: 44.1kHz recommended
- Duration: 300-500ms per letter
- Volume: Normalized to prevent clipping

## Fallback Behavior
If MP3 files are not found, the game will automatically fall back to synthesized tones based on letter frequencies.