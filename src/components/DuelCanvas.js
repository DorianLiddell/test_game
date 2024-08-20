import React, { useEffect, useRef, useState, useCallback } from 'react';
import HeroMenu from './HeroMenu';

const DuelCanvas = () => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);

    const [hero1, setHero1] = useState({
        x: 50,
        y: 150,
        radius: 30,
        speed: 0.5,          // Минимальная скорость
        direction: 1,
        color: 'blue',
        score: 0,
        shootInterval: 5000,  // Минимальный интервал стрельбы
        lastShotTime: 0
    });

    const [hero2, setHero2] = useState({
        x: 750,
        y: 150,
        radius: 30,
        speed: 0.5,          // Минимальная скорость
        direction: 1,
        color: 'red',
        score: 0,
        shootInterval: 5000,  // Минимальный интервал стрельбы
        lastShotTime: 0
    });

    const [spells, setSpells] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [menuHero1Open, setMenuHero1Open] = useState(false);
    const [menuHero2Open, setMenuHero2Open] = useState(false);

    const spellSpeed = 2; // Скорость заклинаний

    const updateHeroPosition = useCallback((hero, setHero, canvasHeight) => {
        setHero((prevHero) => {
            const { y, radius, speed, direction } = prevHero;
            let newDirection = direction;

            if (y + radius >= canvasHeight || y - radius <= 0) {
                newDirection *= -1;
            }

            const dist = Math.hypot(prevHero.x - mousePos.x, y - mousePos.y);
            if (dist < radius + 10) {
                newDirection *= -1;
            }

            const newY = y + speed * newDirection;
            return { ...prevHero, y: newY, direction: newDirection };
        });
    }, [mousePos]);

    const drawHero = useCallback((context, hero) => {
        context.beginPath();
        context.arc(hero.x, hero.y, hero.radius, 0, Math.PI * 2, false);
        context.fillStyle = hero.color;
        context.fill();
        context.closePath();
    }, []);

    const updateSpells = useCallback((context, spellsList, canvasWidth, canvasHeight) => {
        const newSpells = spellsList
            .map(spell => {
                const newX = spell.x + spellSpeed * spell.direction;
                return { ...spell, x: newX };
            })
            .filter(spell => {
                // Проверка на столкновение с границей холста
                return spell.x > 0 && spell.x < canvasWidth;
            })
            .filter(spell => {
                // Проверка на попадание по герою 1
                const hitHero1 = Math.hypot(spell.x - hero1.x, spell.y - hero1.y) < spell.radius + hero1.radius;
                if (hitHero1) {
                    setHero1(prev => ({ ...prev, score: prev.score + 1 }));
                    return false;
                }

                // Проверка на попадание по герою 2
                const hitHero2 = Math.hypot(spell.x - hero2.x, spell.y - hero2.y) < spell.radius + hero2.radius;
                if (hitHero2) {
                    setHero2(prev => ({ ...prev, score: prev.score + 1 }));
                    return false;
                }

                return true;
            });

        newSpells.forEach(spell => {
            context.beginPath();
            context.arc(spell.x, spell.y, spell.radius, 0, Math.PI * 2, false);
            context.fillStyle = spell.color;
            context.fill();
            context.closePath();
        });

        setSpells(newSpells);
    }, []);

    const shootSpell = useCallback((hero, direction) => {
        setSpells(prevSpells => [
            ...prevSpells,
            {
                x: hero.x + direction * hero.radius,
                y: hero.y,
                radius: 10,
                color: hero.color,
                direction
            }
        ]);
    }, []);

    const handleCanvasClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const isHero1Clicked = Math.hypot(clickX - hero1.x, clickY - hero1.y) < hero1.radius;
        const isHero2Clicked = Math.hypot(clickX - hero2.x, clickY - hero2.y) < hero2.radius;

        if (isHero1Clicked) {
            setMenuHero1Open(!menuHero1Open);  // Переключение меню героя 1
            setMenuHero2Open(false);           // Закрытие меню героя 2, если открыто
        } else if (isHero2Clicked) {
            setMenuHero2Open(!menuHero2Open);  // Переключение меню героя 2
            setMenuHero1Open(false);           // Закрытие меню героя 1, если открыто
        } else {
            setMenuHero1Open(false);
            setMenuHero2Open(false);
        }
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleSpellColorChange = (hero, color) => {
        if (hero === 'hero1') {
            setHero1(prev => ({ ...prev, color }));
        } else if (hero === 'hero2') {
            setHero2(prev => ({ ...prev, color }));
        }
    };

    const handleShootingFrequencyChange = (hero, frequency) => {
        const maxMultiplier = 2;
    
        if (hero === 'hero1') {
            setHero1(prev => {
                const minFrequency = prev.shootInterval / maxMultiplier;
                const newFrequency = Math.max(frequency, minFrequency);
                return { ...prev, shootInterval: newFrequency };
            });
        } else if (hero === 'hero2') {
            setHero2(prev => {
                const minFrequency = prev.shootInterval / maxMultiplier;
                const newFrequency = Math.max(frequency, minFrequency);
                return { ...prev, shootInterval: newFrequency };
            });
        }
    };
    
    const handleSpeedChange = (hero, speed) => {
        const maxMultiplier = 2;
    
        if (hero === 'hero1') {
            setHero1(prev => {
                const maxSpeed = prev.speed * maxMultiplier;
                const newSpeed = Math.min(speed, maxSpeed);
                return { ...prev, speed: newSpeed };
            });
        } else if (hero === 'hero2') {
            setHero2(prev => {
                const maxSpeed = prev.speed * maxMultiplier;
                const newSpeed = Math.min(speed, maxSpeed);
                return { ...prev, speed: newSpeed };
            });
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const renderFrame = (time) => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Отрисовка границы
            context.strokeStyle = 'black';
            context.lineWidth = 5;
            context.strokeRect(0, 0, canvas.width, canvas.height);

            updateHeroPosition(hero1, setHero1, canvas.height);
            updateHeroPosition(hero2, setHero2, canvas.height);

            drawHero(context, hero1);
            drawHero(context, hero2);

            updateSpells(context, spells, canvas.width);

            // Стрельба героя 1
            if (time - hero1.lastShotTime > hero1.shootInterval) {
                shootSpell(hero1, 1);
                setHero1(prev => ({ ...prev, lastShotTime: time }));
            }

            // Стрельба героя 2
            if (time - hero2.lastShotTime > hero2.shootInterval) {
                shootSpell(hero2, -1);
                setHero2(prev => ({ ...prev, lastShotTime: time }));
            }

            requestRef.current = requestAnimationFrame(renderFrame);
        };

        requestRef.current = requestAnimationFrame(renderFrame);

        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, [
        hero1,
        hero2,
        spells,
        shootSpell,
        updateHeroPosition,
        drawHero,
        updateSpells
    ]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                style={{ border: '2px solid black' }}
            ></canvas>
            {menuHero1Open && (
                <HeroMenu
                    onSpellColorChange={(color) => handleSpellColorChange('hero1', color)}
                    onShootingFrequencyChange={(frequency) => handleShootingFrequencyChange('hero1', frequency)}
                    onSpeedChange={(speed) => handleSpeedChange('hero1', speed)}
                />
            )}
            {menuHero2Open && (
                <HeroMenu
                    onSpellColorChange={(color) => handleSpellColorChange('hero2', color)}
                    onShootingFrequencyChange={(frequency) => handleShootingFrequencyChange('hero2', frequency)}
                    onSpeedChange={(speed) => handleSpeedChange('hero2', speed)}
                />
            )}
            <div>
                <p>Score Hero 1: {hero1.score}</p>
                <p>Score Hero 2: {hero2.score}</p>
            </div>
        </div>
    );
};

export default DuelCanvas;



















