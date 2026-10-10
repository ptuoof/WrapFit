import type { Metadata } from 'next';
import PackagingStudioPage from '@/views/editor/studio';

export const metadata: Metadata = {
  title: 'Master 3D Packaging Studio & Dieline Canvas | WrapFit',
  description: 'Trình thiết kế bao bì cao cấp thời gian thực 2D & 3D, kiểm định FitCheck™ và xuất file CAD chuẩn công nghiệp.',
};

export default function Page() {
  return <PackagingStudioPage />;
}
