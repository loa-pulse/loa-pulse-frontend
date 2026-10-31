import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** 테스트(Node)용 목업 서버. 테스트마다 server.use()로 응답을 바꿀 수 있다 */
export const server = setupServer(...handlers)
