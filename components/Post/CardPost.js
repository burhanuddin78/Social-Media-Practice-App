import React, { useEffect, useState } from 'react';

import { Card, Icon, Image, Divider, Segment, Button, Popup, Header, Modal } from 'semantic-ui-react';
import PostComments from './PostComments';
import CommentInputField from './CommentInputField';
import Link from 'next/link';
import calculateTime from '../../utils/calculateTime.js';
import { deletePost, likePost } from '../../utils/postActions.js';
import LikesList from './LikesList.js';
import NoImageModal from './NoImageModal.js';
import ImageModal from './ImageModal.js';

function CardPost({ post, user, setPosts, setShowToaster }) {
	const [likes, setLikes] = useState(post.likes);
	const [comments, setComments] = useState(post.comments);
	const [error, setError] = useState(null);

	const [showModal, setShowModal] = useState(false);

	const isLiked = likes.length > 0 && likes.filter((like) => like.user == user._id).length > 0;

	const addPropsToModal = () => {
		return {
			post,
			user,
			setLikes,
			likes,
			isLiked,
			comments,
			setComments,
		};
	};

	return (
		<>
			{showModal && (
				<Modal
					open={showModal}
					closeIcon
					closeOnDimmerClick
					onClose={() => setShowModal(false)}>
					<Modal.Content>{post.picUrl ? <ImageModal {...addPropsToModal()} /> : <NoImageModal {...addPropsToModal()} />}</Modal.Content>
				</Modal>
			)}
			<Segment basic>
				<Card
					color='teal'
					fluid>
					{post.picUrl && (
						<Image
							src={post.picUrl}
							style={{ cursor: 'pointer' }}
							floated='left'
							wrapped
							ui={false}
							alt='PostImage'
							onClick={() => setShowModal(true)}
						/>
					)}

					<Card.Content>
						<Image
							floated='left'
							avatar
							circular
							src={post?.user?.profilePicUrl}
						/>

						{user.role == 'root' ||
							(post.user._id == user._id && (
								<>
									<Popup
										on='click'
										position='top right'
										trigger={
											<Image
												src='/deleteIcon.svg'
												style={{ cursor: 'pointer' }}
												size='mini'
												floated='right'
											/>
										}>
										<Header
											as='h4'
											content='Are you sure?'
										/>

										<p>This action is irreversible!</p>

										<Button
											color='red'
											icon='trash'
											content='Delete'
											onClick={() => deletePost(post._id, setPosts, setShowToaster)}></Button>
									</Popup>
								</>
							))}
					</Card.Content>

					<Card.Header>
						<Link href={`/${post.user.username}`}>
							<>{post.user.name}</>
						</Link>
					</Card.Header>

					<Card.Meta>{calculateTime(post.createdAt)}</Card.Meta>

					{post.location && <Card.Meta content={post.location} />}

					<Card.Description style={{ fontSize: '17px', letterSpacing: '0.1px', wordSpacing: '0.35px' }}>{post.text}</Card.Description>

					<Card.Content extra>
						<Icon
							name={isLiked ? 'heart' : 'heart outline'}
							color='red'
							style={{ cursor: 'pointer' }}
							onClick={() => likePost(post._id, user._id, setLikes, isLiked ? false : true)}
						/>

						<LikesList
							postId={post._id}
							trigger={likes.length > 0 && <span className='spanLikesList'>{`${likes.length} ${likes.length == 1 ? 'like' : 'likes'}`}</span>}
						/>
						<Icon
							name='comment outline'
							style={{ marginLeft: '7px' }}
							color='blue'
						/>

						{comments.length > 0 &&
							comments.map(
								(comment, index) =>
									index < 3 && (
										<PostComments
											key={comment._id}
											comment={comment}
											postId={post._id}
											user={user}
											setComments={setComments}
										/>
									),
							)}

						{comments.length > 3 && (
							<Button
								content='View More'
								color='teal'
								basic
								circular
								onClick={() => setShowModal(true)}
							/>
						)}

						<Divider hidden />

						<CommentInputField
							user={user}
							postId={post._id}
							setComments={setComments}
						/>
					</Card.Content>
				</Card>
			</Segment>
			<Divider hidden />
		</>
	);
}

export default CardPost;
