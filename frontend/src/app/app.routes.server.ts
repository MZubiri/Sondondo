import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'tour/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [
        { slug: 'vuelo-del-condor-mayobamba' },
        { slug: 'andenes-andamarca-danza-tijeras' },
        { slug: 'volcan-pachapupum-termas' },
        { slug: 'pampa-galeras-vicunas-apu-qarhuarazo' },
        { slug: 'pueblos-magicos-aucara-cabana-chipao' },
        { slug: 'gran-travesia-valle-sondondo-3d2n' },
        { slug: 'expedicion-valle-sondondo-3d2n' },
        { slug: 'circuito-terrazas-andenes-incas' },
        { slug: 'avistamiento-condores-mayobamba' },
        { slug: 'ruta-cataratas-aguas-termales' },
        { slug: 'trekking-volcan-ccarhuarazo' },
        { slug: 'experiencia-vivencial-comunidades' }
      ];
    }
  },
  {
    path: 'terminos-y-condiciones',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'politica-de-cancelacion',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'politica-de-privacidad',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'libro-de-reclamaciones',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'pago/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];

