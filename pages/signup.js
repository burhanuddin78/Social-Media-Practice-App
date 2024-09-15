import React, { useState, useEffect, useRef } from 'react';
import { FooterMessage, HeaderMessage } from '../components/Common/WelcomeMessage';
import { Form, Button, Message, Segment, TextArea, Divider } from 'semantic-ui-react';
import CommonInputs from '../components/Common/CommonInputs';
import ImageDropDiv from '../components/Common/ImageDropDiv';

function login() {
	const [user, setUser] = useState({
		name: '',
		username: '',
		email: '',
		password: '',
		bio: '',
		facebook: '',
		youtube: '',
		twitter: '',
		Instagram: '',
	});

	const [showSocialLinks, setShowSocialLinks] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formLoading, setFormLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [usernameLoading, setUsernameLoading] = useState(false);
	const [usernameAvailable, setUsernameAvailable] = useState(false);
	const [media, setMedia] = useState(null);
	const [mediaPreview, setMediaPreview] = useState(null);
	const [highlighted, setHighlighted] = useState(false);
	const inputRef = useRef(null);

	const { name, username, email, password, bio } = user;

	const handleSubmit = (event) => {
		e.preventDefault();
	};
	const handleChangeInput = (event) => {
		const { name, value, files } = event.target;

		if (name === 'media') {
			setMedia(files[0]);
			setMediaPreview(URL.createObjectURL(files[0]));
		} else {
			setUser((prev) => ({ ...prev, [name]: value }));
		}
	};

	return (
		<>
			{' '}
			<HeaderMessage />
			<Form
				loading={formLoading}
				error={errorMessage !== null}
				onSubmit={handleSubmit}>
				<Message
					error
					header='oops!'
					content={errorMessage}
					onDismiss={() => setErrorMessage(null)}
				/>

				<Segment>
					<ImageDropDiv
						highlighted={highlighted}
						setHighlighted={setHighlighted}
						mediaPreview={mediaPreview}
						setMediaPreview={setMediaPreview}
						setMedia={setMedia}
						inputRef={inputRef}
						handleChange={handleChangeInput}
					/>
					<Form.Input
						required
						label='Name'
						placeholder='name'
						name='name'
						value={name}
						onChange={handleChangeInput}
						fluid
						icon='user'
						iconPosition='left'
					/>
					<Form.Input
						required
						label='Email'
						placeholder='Email'
						name='email'
						value={email}
						onChange={handleChangeInput}
						fluid
						icon='envelope'
						iconPosition='left'
						type='email'
					/>
					<Form.Input
						required
						label='Password'
						placeholder='password'
						name='password'
						value={password}
						onChange={handleChangeInput}
						fluid
						icon={{
							name: 'eye',
							circle: true,
							link: true,
							onClick: () => setShowPassword(!showPassword),
						}}
						iconPosition='left'
						type={showPassword ? 'text' : 'password'}
					/>

					<Form.Input
						required
						loading={usernameLoading}
						error={!usernameAvailable}
						label='Username'
						placeholder='Username'
						name='username'
						value={username}
						onChange={handleChangeInput}
						fluid
						icon={usernameAvailable ? 'check' : 'close'}
						iconPosition='left'
					/>
					<CommonInputs
						user={user}
						showSocialLinks={showSocialLinks}
						setShowSocialLinks={setShowSocialLinks}
						handleChange={handleChangeInput}
					/>

					<Divider hidden />

					<Button
						icon='signup'
						content='Signup'
						type='submit'
						color='orange'
						disabled={!usernameAvailable}
					/>
				</Segment>
			</Form>
			<FooterMessage />
		</>
	);
}
export default login;
