import Superset from './Superset.js';
import { Point } from './geometry/point.js';
import { Rect } from './geometry/rect.js';
import './geometry/shape.js';
/**
 * @typedef DividedTree
 * @property {true} divided
 * @property {Tree[]} nodes
 */
/**
 * @typedef UndividedTree
 * @property {false} divided
 * @property {Point[]} points
 */
/**
 * @typedef {DividedTree|UndividedTree} Tree
 */
/**
 * @typedef QuadTreeOpts
 * @property {Number} maxDepth
 * @property {Number} maxPointsPerNode
 * @property {Boolean} removeEmptyNodes
 */
/**
 * @type {QuadTreeOpts}
 */
export const defaultQuadtreeOpts = {
    maxDepth: -1,
    maxPointsPerNode: 4,
    removeEmptyNodes: false,
};
export class QuadTree {
    /**
     *
     * @param {Rect} bounds
     * @param {QuadTreeOpts=} opts
     */
    constructor(bounds, opts) {
        /**
         * @type {QuadTreeOpts}
         */
        this.opts = { ...defaultQuadtreeOpts, ...opts };
        /**
         * @type {Supersets}
         */
        this.points = new Superset();
        /**
         * @type {Superset}
         */
        this.nodes = new Superset();
    }
    /**
     * @returns {Tree}
     */
    getTree() {
        if (this.nodes.size > 0) {
            return {
                divided: true,
                nodes: this.nodes.array().map((n) => n.getTree()),
            };
        } else {
            return {
                divided: false,
                points: this.points.array().slice(),
            };
        }
    }
    /**
     *
     * @returns {Point[]}
     */
    getPoints() {
        return this.getAllPointsRecursive();
    }
    /**
     *
     * @param  {...Point} points
     * @returns {Boolean}
     */
    insert(...points) {
        let returnValue = false;
        for (const point of points) {
            if (this.insertRecursive(point)) returnValue = true;
        }
        return returnValue;
    }
    /**
     *
     * @param  {...Point} points
     * @returns {Boolean}
     */
    remove(...points) {
        let returnValue = false;
        for (const point of points) {
            if (this.removeRecursive(point)) returnValue = true;
        }
        return returnValue;
    }
    /**
     *
     * @param {Shape} range
     * @returns {Point[]}
     */
    query(range) {
        return this.queryRecursive(range);
    }
    divide() {
        const maxDepth = this.opts.maxDepth;
        const childMaxDepth = maxDepth === -1 ? -1 : maxDepth - 1;
        const childOpts = { ...this.opts, maxDepth: childMaxDepth };

        const x = this.bounds.x;
        const y = this.bounds.y;
        const width = this.bounds.width / 2;
        const height = this.bounds.height / 2;

        const ne = new Rect(x + width / 2, y - height / 2, width, height);
        const nw = new Rect(x - width / 2, y - height / 2, width, height);
        const se = new Rect(x + width / 2, y + height / 2, width, height);
        const sw = new Rect(x - width / 2, y + height / 2, width, height);

        this.nodes
            .add(new QuadTree(ne, childOpts))
            .add(new QuadTree(nw, childOpts))
            .add(new QuadTree(se, childOpts))
            .add(new QuadTree(sw, childOpts));

        this.insert(...this.points.array().slice());

        this.points.clear();
    }
    /**
     *
     * @param {Point} point
     * @returns {Boolean}
     */
    insertRecursive(point) {
        if (!this.bounds.contains(point)) return false;

        const pointCount = this.points.size;
        const maxPointCount = this.opts.maxPointsPerNode;
        const maxDepth = this.opts.maxDepth;

        if (this.nodes.size === 0) {
            if (pointCount < maxPointCount || maxDepth === 0) {
                this.points.add(point);
                return true;
            } else if (maxDepth === -1 || maxDepth > 0) {
                this.divide();
            }
        }

        if (this.nodes.size > 0) {
            for (const node of this.nodes) {
                if (node.insertRecursive(point)) return true;
            }
        }

        return false;
    }
    /**
     *
     * @param {Point} point
     * @returns {Boolean}
     */
    removeRecursive(point) {
        if (!this.bounds.contains(point)) return false;

        if (this.nodes.size === 0) {
            for (const p of this.points) {
                if (testPointEquality(point, p)) {
                    this.points.delete(p);
                    return true;
                }
            }
            return false;
        }
        let returnValue = false;
        for (const node of this.nodes) {
            if (node.removeRecursive(point)) returnValue = true;
        }
        if (this.opts.removeEmptyNodes) {
            if (this.nodes.every((n) => n.points.size === 0 && n.nodes.size === 0)) this.nodes.clear();
        }

        return returnValue;
    }
    /**
     *
     * @param {Shape} range
     * @returns {Point[]}
     */
    queryRecursive(range) {
        if (!range.intersects(this.bounds)) return [];
        /**
         * @type {Point[]}
         */
        const pointsFound = [];

        if (this.nodes.size > 0) {
            for (const node of this.nodes) {
                pointsFound.push(...node.queryRecursive(range));
            }
        } else {
            for (const point of this.points) {
                if (range.contains(point)) pointsFound.push(point);
            }
        }

        return pointsFound;
    }

    /**
     *
     * @returns {Point[]}
     */
    getAllPointsRecursive() {
        /**
         * @type {Point[]}
         */
        const points = [];

        if (this.nodes.size > 0) {
            for (const node of this.nodes) {
                points.push(...node.getAllPointsRecursive());
            }
        } else {
            points.push(...this.points);
        }

        return points;
    }
}

/**
 *
 * @param {Point} a
 * @param {Point} b
 * @returns
 */
function testPointEquality(a, b) {
    return a.x === b.x && a.y === b.y;
}
