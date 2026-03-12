import { useState, useEffect } from 'react';
import { FastAverageColor } from 'fast-average-color';

const fac = new FastAverageColor();

export const useColorThief = (imageUrl) => {
    const [color, setColor] = useState('#000000');

    useEffect(() => {
        if (!imageUrl) return;

        fac.getColorAsync(imageUrl)
            .then(res => {
                // Sacamos el color dominante
                setColor(res.hex);
            })
            .catch(e => {
                console.error(e);
                setColor('#000000');
            });
    }, [imageUrl]);

    return color;
};