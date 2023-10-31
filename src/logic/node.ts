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

export type NodeAndPath = {
    node: GraphNode,
    weight: number,
    path: GraphNode[],
}

export class GraphNode {
    _key: number;
    _name: string;
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

    // noinspection JSUnusedGlobalSymbols
    public findShortestPaths() /*:{ [key: string]: { weight: number, path: GraphNode[] } }*/ {

        function findAndRemoveMin(nodes: { [key: string]: NodeAndPath }): NodeAndPath{
            let minNode: NodeAndPath | undefined = undefined;
            for (const node of Object.values(nodes)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (minNode == undefined || node.weight < minNode.weight) {
                    minNode = node;
                    break;
                }
            }
            if (minNode == undefined) throw new Error("No min node found");
            delete nodes[minNode.node.key];
            return minNode;
        }

        const solutions: { [key: string]: NodeAndPath } = {};
        const graphNodes = this.getGraphNodesAndLinks().nodes;
        const remainingNodes: { [key: string]: NodeAndPath } = Object.fromEntries(graphNodes
            .map(node => [node.key, ({node, weight: node === this ? 0 : Infinity, path: [node]} as NodeAndPath)]));

        while (Object.keys(remainingNodes).length > 0) {
            const minimalNode = findAndRemoveMin(remainingNodes);
            solutions[minimalNode.node.key] = minimalNode;
            const currentWeight = minimalNode.weight;
            const currentPath = minimalNode.path;

            for (const {node, linkWeight} of minimalNode.node.links) {
                const nodeAndPath = remainingNodes[node.key] || solutions[node.key];
                const newWeight = currentWeight + linkWeight;

                if (newWeight >= nodeAndPath.weight) continue;

                nodeAndPath.weight = newWeight;
                nodeAndPath.path = [...currentPath, node];
            }
        }

        return solutions;
    }
}