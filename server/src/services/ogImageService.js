const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const FONT_DIR = path.join(__dirname, '../assets/fonts');

let fontsCache = null;
function loadFonts() {
  if (fontsCache) return fontsCache;
  fontsCache = [
    { name: 'Space Grotesk', data: fs.readFileSync(path.join(FONT_DIR, 'SpaceGrotesk-Bold.woff')), weight: 700, style: 'normal' },
    { name: 'Space Grotesk', data: fs.readFileSync(path.join(FONT_DIR, 'SpaceGrotesk-Medium.woff')), weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: fs.readFileSync(path.join(FONT_DIR, 'JetBrainsMono-Regular.woff')), weight: 400, style: 'normal' }
  ];
  return fontsCache;
}

const COLORS = {
  bg: '#0A0A0B',
  surface: '#141416',
  border: '#26262A',
  textPrimary: '#F2F1EC',
  textSecondary: '#9B9A96',
  textMuted: '#5E5D5A',
  accent: '#E8442E',
  verified: '#5FD68A',
  satirical: '#B39DDB'
};

function verdictFor(count) {
  if (count === 0) return 'clean slate — go build it';
  if (count === 1) return 'someone already did this';
  if (count === 2) return 'a quiet little rivalry';
  return 'fully saturated, good luck';
}

// Truncate long problem text so it doesn't overflow the fixed-size image.
// Breaks at the last whole word rather than cutting mid-word.
function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

function buildTree(problem) {
  const competitors = problem.competitors || [];
  const count = competitors.length;
  const topCompetitor = competitors[0];

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bg,
        padding: '64px',
        fontFamily: 'Inter'
      },
      children: [
        // Header row: logo + saturation dots
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 28, fontFamily: 'Space Grotesk', fontWeight: 700, color: COLORS.textPrimary },
                  children: [
                    { type: 'span', props: { children: "There's a" } },
                    { type: 'span', props: { style: { color: COLORS.accent, marginLeft: '10px', marginRight: '10px' }, children: 'B2B SaaS' } },
                    { type: 'span', props: { children: 'for that.' } }
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: '6px' },
                  children: Array.from({ length: 5 }, (_, i) => ({
                    type: 'div',
                    props: {
                      style: {
                        width: '14px',
                        height: '24px',
                        borderRadius: '3px',
                        backgroundColor: i < Math.min(count, 5) ? COLORS.accent : COLORS.border
                      }
                    }
                  }))
                }
              }
            ]
          }
        },

        // Middle: the problem statement
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '16px' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 16, fontFamily: 'JetBrains Mono', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px' },
                  children: 'your problem'
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 48,
                    fontFamily: 'Space Grotesk',
                    fontWeight: 500,
                    color: COLORS.textPrimary,
                    lineHeight: 1.3
                  },
                  children: `"${truncate(problem.text, 90)}"`
                }
              }
            ]
          }
        },

        // Bottom: competitor summary card + verdict
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '16px',
              padding: '28px 32px'
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 20, fontFamily: 'JetBrains Mono', color: COLORS.textSecondary },
                        children: `${count} business${count === 1 ? '' : 'es'} found`
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 20, fontFamily: 'Inter', color: COLORS.textSecondary },
                        children: `verdict: ${verdictFor(count)}`
                      }
                    }
                  ]
                }
              },
              topCompetitor
                ? {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', gap: '12px', borderTop: `1px solid ${COLORS.border}`, paddingTop: '18px' },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', fontSize: 24, fontFamily: 'Space Grotesk', fontWeight: 700, color: COLORS.textPrimary },
                            children: topCompetitor.name
                          }
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              fontSize: 14,
                              fontFamily: 'JetBrains Mono',
                              color: topCompetitor.isReal ? COLORS.verified : COLORS.satirical,
                              border: `1px solid ${topCompetitor.isReal ? COLORS.verified : COLORS.satirical}`,
                              borderRadius: '999px',
                              padding: '4px 12px',
                              textTransform: 'uppercase'
                            },
                            children: topCompetitor.isReal ? 'verified' : 'satirical'
                          }
                        }
                      ]
                    }
                  }
                : {
                    type: 'div',
                    props: {
                      style: { display: 'flex', fontSize: 18, color: COLORS.textMuted, borderTop: `1px solid ${COLORS.border}`, paddingTop: '18px' },
                      children: 'nothing here yet — you might have a billion dollar idea'
                    }
                  }
            ]
          }
        }
      ]
    }
  };
}

async function renderOgImagePng(problem) {
  const svg = await satori(buildTree(problem), {
    width: 1200,
    height: 630,
    fonts: loadFonts()
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const pngData = resvg.render();
  return pngData.asPng();
}

module.exports = { renderOgImagePng };
