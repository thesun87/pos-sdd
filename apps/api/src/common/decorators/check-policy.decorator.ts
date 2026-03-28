import { SetMetadata } from '@nestjs/common';

export interface PolicyCheck {
  action: string;   // 'discount', 'void', 'refund', 'cancel', 'edit_price'
  resource: string; // 'order', 'order_item', 'payment'
}

export const CHECK_POLICY_KEY = 'check_policy';
export const CheckPolicy = (check: PolicyCheck) => SetMetadata(CHECK_POLICY_KEY, check);
