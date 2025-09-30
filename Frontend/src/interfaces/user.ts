export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}