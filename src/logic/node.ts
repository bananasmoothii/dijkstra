const hues = [
    281,
    161,
    41,
]

export class GraphNode {
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
        if (name.length < 1) throw new Error("Name cannot be empty");
        this._name = name;
        this.display = { // random x and y
            x: Math.random() * 960 + 20,
            y: Math.random() * 540 + 90,
            hue: hues[name.charCodeAt(0) % hues.length],
        }
    }

    get name(): string {
        return this._name;
    }

    public linkTo(node: GraphNode, weight: number) {
        this.links.push({
            node,
            linkWeight: weight,
        });
    }

    public infiniteLinkTo(node: GraphNode) {
        this.linkTo(node, Number.MAX_VALUE);
    }
}