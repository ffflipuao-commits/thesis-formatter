import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserVipPermissions } from '@/lib/vip';
import { PreviewClient } from './PreviewClient';

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: doc } = await supabase
    .from('documents').select('*').eq('id', params.id).eq('user_id', user.id).single();
  if (!doc) return notFound();

  const permissions = await getUserVipPermissions(user.id);

  return (
    <PreviewClient
      documentId={doc.id}
      documentName={doc.original_name}
      status={doc.status}
      isVip={permissions.isVip}
      canPreviewFull={permissions.canPreviewFull}
    />
  );
}
