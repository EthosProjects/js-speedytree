import { Point } from './point.js'
export class Rect {
    constructor(
        x, y, width, height 
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get top() {
        return this.y - this.height / 2
    }
    get bottom() {
        return this.y + this.height / 2
    }
    get left() {
        return this.x - this.width / 2
    }
    get right() {
        return this.x + this.width / 2
    }
    /**
     * 
     * @param {Point} point 
     * @returns {Boolean}
     */
    contains(point) {
        return (
            point.x >= this.left &&
            point.x <= this.right &&
            point.y >= this.top &&
            point.y <= this.bottom
        )
    }
    /**
     * 
     * @param {Rect} range 
     * @returns {Boolean}
     */
    intersects(range) {
        return !(
            range.left > this.right ||
            range.right < this.left ||
            range.top > this.bottom ||
            range.bottom < this.top
        )
    }
}