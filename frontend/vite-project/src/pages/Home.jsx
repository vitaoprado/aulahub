import React, { useState } from 'react';
import Mural from '../components/Mural.jsx';
import CadastroAula from '../components/CadastroAula.jsx';
import GridAulas from '../components/GridAulas.jsx';
import banner1 from '../assets/banner1.png';
import banner2 from '../assets/banner2.png';
import banner3 from '../assets/banner3.png';
import banner4 from '../assets/banner4.png';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const bannerStyle = { width: '100%', display: 'block', borderRadius: 8 };

  return (
    <div style={{ maxWidth: 1100, margin: '26px auto' }}>
      {/* Mural */}
      <Mural />

      {/* Banners */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="card"><img src={banner1} alt="banner 1" style={bannerStyle} /></div>
        <div className="card"><img src={banner2} alt="banner 2" style={bannerStyle} /></div>
        <div className="card"><img src={banner3} alt="banner 3" style={bannerStyle} /></div>
        <div className="card"><img src={banner4} alt="banner 4" style={bannerStyle} /></div>
      </div>

      {/* Cadastro de Aula (sem login) */}
      <CadastroAula onCreated={() => setRefreshKey((k) => k + 1)} />

      {/* Grid de aulas cadastradas */}
      <GridAulas refreshKey={refreshKey} />
    </div>
  );
}
