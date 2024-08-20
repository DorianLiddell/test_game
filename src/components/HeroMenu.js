import React from 'react';
import './styles.css';

const HeroMenu = ({ onSpellColorChange, onShootingFrequencyChange, onSpeedChange }) => {
    return (
        <div className="hero-menu">
            <label>Цвет заклинания</label>
            <input type="color" onChange={(e) => onSpellColorChange(e.target.value)} />

            <label>Частота стрельбы</label>
            <input type="range" min="1" max="10" onChange={(e) => onShootingFrequencyChange(parseInt(e.target.value))} />

            <label>Скорость передвижения</label>
            <input type="range" min="1" max="10" onChange={(e) => onSpeedChange(parseInt(e.target.value))} />
        </div>
    );
};

export default HeroMenu;
