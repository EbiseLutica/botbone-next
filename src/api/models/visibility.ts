export type Visibility = 
  // 不特定多数に公開
  | 'public'
  // 全公開ほどではないが非公開でもない
  | 'insider'
  // 限られた人にのみ公開
  | 'friends' 
  // 明示的に指定した人にのみ公開
  | 'direct' 
  // 自分にのみ公開
  | 'private'
  // その他
  | 'other' 
  ;
