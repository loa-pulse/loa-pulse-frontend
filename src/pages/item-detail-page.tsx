import { useParams } from 'react-router'

/** 아이템 상세 (/items/:itemId). 가격 카드, 차트, 이 아이템 알림 */
function ItemDetailPage() {
  const { itemId } = useParams()
  return (
    <>
      <title>아이템 시세 · LoaPulse</title>
      <h1 className="text-[28px] leading-9 font-bold">아이템 {itemId}</h1>
    </>
  )
}

export default ItemDetailPage
