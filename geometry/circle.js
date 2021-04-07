import { Point } from './point.js';
import { Rect } from './rect.js';

export class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    /**
     *
     * @param {Point} point
     * @returns {Boolean}
     */
    contains(point) {
        const xDiff = point.x - this.x;
        const yDiff = point.y - this.y;
        return xDiff * xDiff + yDiff * yDiff <= this.radius * this.radius;
    }
    /**
     *
     * @param {Rect} range
     * @returns {Boolean}
     */
    intersects(range) {
        const xDiff = Math.abs(range.x - this.x);
        const yDiff = Math.abs(range.y - this.y);

        if (xDiff > range.width / 2 + this.radius) return false;
        if (yDiff > range.height / 2 + this.radius) return false;
        if (xDiff <= range.width / 2) return true;
        if (yDiff <= range.height / 2) return true;

        const cX = xDiff - range.width / 2;
        const cY = yDiff - range.height / 2;
        const cornerDist = cX * cX + cY * cY;

        return cornerDist <= this.radius * this.radius;
    }
}
