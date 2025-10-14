import React from 'react';
import Mural from '../components/Mural.jsx';
import banner1 from '../assets/banner1.png';
import banner2 from '../assets/banner2.png';
import banner3 from '../assets/banner3.png';
import banner4 from '../assets/banner4.png';

export default function Home() {
  return (
    <div style={{ maxWidth: 1100, margin: '26px auto' }}>
      <Mural />
      <div className="grid">
        <div className="card card--purple tile">
          <div className="tile-inner">
            <img src={banner1} alt="banner 1" />
          </div>
        </div>
        <div className="card card--purple tile">
          <div className="tile-inner">
            <img src={banner2} alt="banner 2" />
          </div>
        </div>
        <div className="card card--purple tile">
          <div className="tile-inner">
            <img src={banner3} alt="banner 3" />
          </div>
        </div>
        <div className="card card--purple tile">
          <div className="tile-inner">
            <img src={banner4} alt="banner 4" />
          </div>
        </div>
      </div>
    </div>
  );
}
