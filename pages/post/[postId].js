import React from 'react';
import { useRouter } from 'next/router';

function PostPage() {
	const router = useRouter();
	const { postId } = router.query;
	return <div>PostPage</div>;
}

export default PostPage;
