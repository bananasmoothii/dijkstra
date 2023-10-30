const hues = [
    281,
    161,
    41,
]

export class GraphNode {
    _key: number;
    _name: string;
    public weight: number = Number.MAX_VALUE;
    public links: {
        node: GraphNode,
        linkWeight: number,
    }[] = [];
    public display: {
        x: number,
        y: number,
        hue: number,
    };

    constructor(name: string) {
        this._name = "";
        this.display = { // random x and y
            x: Math.random() * 960 + 20,
            y: Math.random() * 540 + 90,
            hue: hues[name.charCodeAt(0) % hues.length],
        }
        this._key = Math.random();
        this._name = name; // validate name here
    }

    get key(): number {
        return this._key;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        if (! name) throw new Error('Name cannot be empty');
        this._name = name;
        this.display.hue = GraphNode.getHueFromName(name);
    }

    private static getHueFromName(name: string) {
        return hues[name.charCodeAt(0) % hues.length];
    }

    public linkTo(node: GraphNode, weight: number) {
        this.links.push({
            node,
            linkWeight: weight,
        });
        node.links.push({
            node: this,
            linkWeight: weight,
        });
    }

    public destroyLinkTo(node: GraphNode) {
        this.links = this.links.filter(link => link.node._key !== node._key);
        node.links = node.links.filter(link => link.node._key !== this._key);
    }

    public linkOrDestroyLinkTo(node: GraphNode, weight: number) {
        if (this.links.some(link => link.node._key === node._key)) {
            this.destroyLinkTo(node);
            console.log('destroyed link');
        } else {
            this.linkTo(node, weight);
            console.log('created link');
        }
    }

    public infiniteLinkTo(node: GraphNode) {
        this.linkTo(node, Infinity);
    }
}