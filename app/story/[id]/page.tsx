import StoryClient from '@/components/storefront/StoryClient';

export default function StoryPage({ params }: { params: { id: string } }) {
  return <StoryClient storyId={params.id} />;
}