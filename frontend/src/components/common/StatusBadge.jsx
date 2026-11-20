// 지원 상태 뱃지 (검토 대기 / 면담 중 / 합류 확정 / 선발 종료 / 신청 취소)
import { APPLICATION_STATUS } from '../../constants/codes'

export default function StatusBadge({ status }) {
  return <span className={`st st-${status.toLowerCase()}`}>{APPLICATION_STATUS[status]}</span>
}
