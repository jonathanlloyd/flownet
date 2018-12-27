import utils from './utils'

let canvas
let ctx
let running
let graph

function setup() {
  let seed = new Date().getTime()
  const numNodes = 80

  canvas = document.getElementById('stage')
  canvas.width = 500
  canvas.height = 500

  ctx = canvas.getContext('2d')
  running = true

  graph = makeGraph(numNodes, seed)

  requestAnimationFrame(draw)
}

const DOT_SIZE = 1.5

function draw() {
  graph = step(graph)

  ctx.fillStyle = '#185d7e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (const node of graph.nodes.values()) {
    const nodeX = canvas.width * node.pos.x
    const nodeY = canvas.height * node.pos.y

    ctx.beginPath()
    ctx.arc(nodeX, nodeY, DOT_SIZE, 0, 2 * Math.PI, true)
    ctx.closePath()
    ctx.fill()
  }

  ctx.lineWidth = '0.1px'
  for (const vertex of graph.vertices) {
    const [nodeID, otherNodeID] = vertex
    const node = graph.nodes.get(nodeID)
    const otherNode = graph.nodes.get(otherNodeID)

    const nodeX = canvas.width * node.pos.x
    const nodeY = canvas.height * node.pos.y
    const otherNodeX = canvas.width * otherNode.pos.x
    const otherNodeY = canvas.height * otherNode.pos.y

    const thresh = 0.2
    const dist = node.pos.distance(otherNode.pos)
    const cappedDist = dist > thresh ? thresh : dist
    const normDist = (cappedDist / thresh) * 1
    let alpha = 1 - normDist
    alpha = Math.atan(1.57 * alpha) / 3
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.beginPath()
    ctx.moveTo(nodeX, nodeY)
    ctx.lineTo(otherNodeX, otherNodeY)
    ctx.closePath()
    ctx.stroke()
  }

  if (running) {
    requestAnimationFrame(draw)
  }
}

const makeNode = ({ id, pos, vel, outgoingVerts = [] }) => {
  return { id, pos, vel, outgoingVerts }
}

const numConnections = 2
const makeGraph = (numNodes, seed) => {
  const prng = new utils.PRNG(seed)

  const nodes = []
  for (let i = 0; i < numNodes; i++) {
    const vel = utils
      .makeRandomVector(prng)
      .subVector(utils.makeVector(0.5, 0.5))
      .multScalar(0.001)
    nodes.push(
      makeNode({
        id: i,
        pos: utils.makeRandomVector(prng),
        vel: vel
      })
    )
  }
  const indexedNodes = new Map()
  for (const node of nodes) {
    indexedNodes.set(node.id, node)
  }

  const vertices = []
  for (const node of nodes) {
    const actualNum = prng.randInt(0, numConnections)
    const connectedNodes = prng.choices(nodes, actualNum)
    for (const otherNode of connectedNodes) {
      vertices.push([node.id, otherNode.id])
    }
  }
  const filteredVerts = vertices
    .filter(([a, b]) => a !== b)
    .filter(
      ([a, b]) =>
        indexedNodes.get(a).pos.distance(indexedNodes.get(b).pos) < 0.4
    )

  return { nodes: indexedNodes, vertices: filteredVerts }
}

const step = graph => {
  const newNodes = new Map()
  for (const node of graph.nodes.values()) {
    const newNode = makeNode(node)
    newNode.pos = newNode.pos.addVector(newNode.vel)
    if (newNode.pos.x < -0.2) newNode.pos.x = 1.2
    if (newNode.pos.x > 1.2) newNode.pos.x = -0.2
    if (newNode.pos.y < -0.2) newNode.pos.y = 1.2
    if (newNode.pos.y > 1.2) newNode.pos.y = -0.2
    newNodes.set(newNode.id, newNode)
  }

  const newVertices = []
  for (const node of newNodes.values()) {
    for (const otherNode of newNodes.values()) {
      if (node === otherNode) {
        continue
      }
      if (node.pos.distance(otherNode.pos) < 0.2) {
        newVertices.push([node.id, otherNode.id])
      }
    }
  }

  return {
    nodes: newNodes,
    vertices: newVertices
  }
}

setup()
