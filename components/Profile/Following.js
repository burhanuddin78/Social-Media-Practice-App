import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button, Image, List, Segment } from 'semantic-ui-react';
import Spinner from '../Layout/Spinner';

import baseUrl from '../../utils/baseUrl';
import cookies from 'js-cookie';
import { NoFollowData } from '../Layout/NoData';
import { followUser, unfollowUser } from '../../utils/profileActions';

function Following({ user, loggedUserFollowStats, setLoggedUserFollowStats, profileUserId }) {
	const [Following, setFollowing] = useState([]);

	const [loading, setLoading] = useState(false);
	const [followLoading, setFollowLoading] = useState(false);

	const getFollowing = async () => {
		const token = cookies.get('token');

		setLoading(true);
		try {
			const res = await axios.get(`${baseUrl}/api/profile/Following/${profileUserId}`, {
				headers: { Authorization: token },
			});

			setFollowing(res.data);
		} catch (error) {}
		setLoading(false);
	};

	useEffect(() => {
		getFollowing();
	}, []);

	return (
		<>
			{loading ? (
				<Spinner />
			) : Following.length > 0 ? (
				Following.map((profileFollowing) => {
					const isFollowing =
						loggedUserFollowStats.following.length > 0 &&
						loggedUserFollowStats.following.filter((following) => following.user === profileFollowing.user._id).length > 0;
					return (
						<>
							<List
								key={profileFollowing.user._id}
								divided
								verticalAlign='middle'>
								<List.Item>
									<List.Content floated='right'>
										{profileFollowing.user._id !== user._id && (
											<Button
												color={isFollowing ? 'instagram' : 'twitter'}
												content={isFollowing ? 'Following' : 'Follow'}
												icon={isFollowing ? 'check' : 'add user'}
												disabled={followLoading}
												onClick={async () => {
													setFollowLoading(true);
													isFollowing
														? await unfollowUser(profileFollowing.user._id, setLoggedUserFollowStats)
														: await followUser(profileFollowing.user._id, setLoggedUserFollowStats);

													setFollowLoading(false);
												}}
											/>
										)}
									</List.Content>
									<Image
										avatar
										src={profileFollowing.user.profilePicUrl}
									/>
									<List.Content
										as='a'
										href={`/${profileFollowing.user.username}`}>
										{profileFollowing.user.name}
									</List.Content>
								</List.Item>
							</List>
						</>
					);
				})
			) : (
				<NoFollowData followingComponent={true} />
			)}
		</>
	);
}

export default Following;
