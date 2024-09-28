import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { Segment } from 'semantic-ui-react';
import { parseCookies } from 'nookies';
import CreatePost from '../components/Post/createPost';
import CardPost from '../components/Post/CardPost';
import { NoPosts } from '../components/Layout/NoData';
import { PostDeleteToastr } from '../components/Layout/Toastr.js';
import InfiniteScroll from 'react-infinite-scroll-component';
import { EndMessage, PlaceHolderPosts } from '../components/Layout/PlaceHolderGroup.js';
import cookies from 'js-cookie';
function Index({ user, postsData = [], errorLoading }) {
	const [posts, setPosts] = useState(postsData);
	const [showToaster, setShowToaster] = useState(false);
	const [pageNumber, setPageNumber] = useState(2);
	const [hasMore, setHasMore] = useState(true);

	const fetchDataOnScroll = async () => {
		try {
			const res = await axios.get(`${baseUrl}/api/posts`, { params: { pageNumber }, headers: { Authorization: cookies.get('token') } });

			if (res.data.length == 0) setHasMore(false);
			setPosts((prev) => [...prev, ...res.data]);
			setPageNumber((prev) => prev + 1);
		} catch (error) {
			alert('Error fetching data');
		}
	};

	useEffect(() => {
		document.title = `Welcome to ${user.name.split(' ')[0]}`;
	}, []);

	useEffect(() => {
		showToaster && setTimeout(() => setShowToaster(false), 3000);
	}, [showToaster]);

	return (
		<>
			{showToaster && <PostDeleteToastr />}
			<Segment>
				<CreatePost
					user={user}
					setPosts={setPosts}
				/>
				{posts?.length == 0 || errorLoading ? (
					<NoPosts />
				) : (
					<InfiniteScroll
						hasMore={hasMore}
						next={fetchDataOnScroll}
						loader={PlaceHolderPosts}
						endMessage={<EndMessage />}
						dataLength={posts.length}>
						{posts.map((post) => (
							<CardPost
								key={post._id}
								post={post}
								setPosts={setPosts}
								user={user}
								setShowToaster={setShowToaster}
							/>
						))}
					</InfiniteScroll>
				)}
			</Segment>
		</>
	);
}

Index.getInitialProps = async (ctx) => {
	try {
		const token = parseCookies(ctx).token;
		const res = await axios.get(`${baseUrl}/api/posts`, {
			params: { pageNumber: 1 },
			headers: {
				authorization: token,
			},
		});

		return { postsData: res.data };
	} catch (error) {
		console.log(error, 'error');
		return { errorLoading: true };
	}
};
export default Index;
