import WsClient from "../interfaces/wsClient.interface"

const getWsClientsUids = (wsClients: WsClient[]) => wsClients.map(({ uid }) => uid)

export default getWsClientsUids