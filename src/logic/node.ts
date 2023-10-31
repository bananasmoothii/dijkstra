/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Link} from "@/components/NodeGroup.vue";

const hues = [
    281,
    161,
    41,
]

type NodeDisplay = {
    x: number,
    y: number,
    hue: number,
};

type NodeDisplays = { [key: string]: NodeDisplay };

type LinkSurrogate = {
    node1: string,
    node2: string,
    weight: number | string,
}

export class GraphNode {
    _key: number;
    _name: string;
    public weight = Infinity;
    public links: {
        node: GraphNode,
        linkWeight: number,
    }[] = [];
    public display: NodeDisplay;

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
        if (!name) throw new Error('Name cannot be empty');
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
        } else {
            this.linkTo(node, weight);
        }
    }

    public getGraphNodesAndLinks(): { nodes: GraphNode[], links: Link[] } {
        const nodes: GraphNode[] = [];
        const links: Link[] = [];
        const nodesToAdd: GraphNode[] = [this];
        while (nodesToAdd.length > 0) {
            const node1 = nodesToAdd.pop() as GraphNode;
            if (nodes.some(node => node.key === node1.key)) continue;
            nodes.push(node1);
            for (const link1 of node1.links) {
                // adding node
                const node2 = link1.node;
                nodesToAdd.push(node2);

                // adding line between nodes, but not adding both lines because our graph is undirected
                if (links.some(link => link.node1 == node2 && link.node2 == node1)) continue;
                let link2: { node: GraphNode, linkWeight: number } | undefined = undefined;
                for (const link2Test of node2.links) {
                    if (link2Test.node.key === node1.key) {
                        link2 = link2Test;
                        break;
                    }
                }
                if (link2 == undefined) throw new Error("Link not found, graph is not valid");
                links.push({
                    node1,
                    node2,
                    base: {
                        startHue: node1.display.hue,
                        endHue: node2.display.hue,
                        graphWeight: link1.linkWeight,
                        updateGraphWeight(newWeight: number) {
                            link1.linkWeight = newWeight;
                            if (link2 != undefined) link2.linkWeight = newWeight;
                        }
                    }
                });
            }
        }
        return {nodes, links};
    }

    public graphToString(): string | null {
        const {nodes, links} = this.getGraphNodesAndLinks();

        const nodeNames = nodes.map(n => n.name);
        if (nodeNames.length !== new Set(nodeNames).size) {
            alert("Duplicate node names, please fix before saving");
            return null;
        }
        const nodesObjects: NodeDisplays = Object.fromEntries(nodes.map(n => [n.name, n.display]));
        const linksObjects: LinkSurrogate[] = links.map(l => {
            let weight: number | string = l.base.graphWeight;
            if (weight === Infinity) weight = "inf";
            return {node1: l.node1.name, node2: l.node2.name, weight}
        });
        return JSON.stringify({root: this.name, nodes: nodesObjects, links: linksObjects});
    }

    public static graphFromString(graphString: string): GraphNode {
        const {root, nodes, links} = JSON.parse(graphString) as {
            root: string,
            nodes: NodeDisplays,
            links: LinkSurrogate[]
        };

        function buildNode(name: string): GraphNode {
            const node = new GraphNode(name);
            node.display = nodes[name];
            return node;
        }

        const graphNode = buildNode(root);
        const adddedNodes: GraphNode[] = [graphNode];
        for (const link of links) {
            let node1 = adddedNodes.find(n => n.name === link.node1);
            let node2 = adddedNodes.find(n => n.name === link.node2);
            if (!node1) {
                node1 = buildNode(link.node1);
                adddedNodes.push(node1);
            }
            if (!node2) {
                node2 = buildNode(link.node2);
                adddedNodes.push(node2);
            }
            let weight: number | string = link.weight;
            if (weight === "inf") weight = Infinity;
            const weightNb = typeof weight === "number" ? weight : parseFloat(weight);
            node1.linkTo(node2, weightNb);
        }
        return graphNode;
    }

    public findShortestPaths() /*:{ [key: string]: { weight: number, path: GraphNode[] } }*/ {

        function findAndRemoveMin(nodes: GraphNode[]): GraphNode {
            let minNode: GraphNode | undefined = undefined;
            let minNodeIndex = -1;
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (minNode == undefined || node.weight < minNode.weight) {
                    minNode = node;
                    minNodeIndex = i;
                }
            }
            if (minNode == undefined) throw new Error("No min node found");
            nodes.splice(minNodeIndex, 1);
            return minNode;
        }

        const solutions: { weight: number, target: GraphNode }[] = [];
        const remainingNodes = this.getGraphNodesAndLinks().nodes;
        // reset node weights
        for (const node of remainingNodes) {
            if (node === this) node.weight = 0;
            else node.weight = Infinity;
        }

        while (remainingNodes.length > 0) {
            const minimalNode = findAndRemoveMin(remainingNodes);
            solutions.push({weight: minimalNode.weight, target: minimalNode});
            const currentWeight = minimalNode.weight;

            for (const {node, linkWeight} of minimalNode.links) {
                node.weight = Math.min(node.weight, currentWeight + linkWeight);
            }
        }

        return solutions;
    }
}