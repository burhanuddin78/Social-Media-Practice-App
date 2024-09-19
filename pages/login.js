import React, { useState, useEffect, useRef } from 'react';
import { FooterMessage, HeaderMessage } from '../components/Common/WelcomeMessage';
import { Form, Button, Message, Segment, TextArea, Divider } from 'semantic-ui-react';
import { loginUser } from '../utils/authUser';

function login() {
	const [user, setUser] = useState({
		email: '',
		password: '',
	});

	const [showPassword, setShowPassword] = useState(false);
	const [formLoading, setFormLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const { email, password } = user;

	const handleChangeInput = (event) => {
		const { name, value } = event.target;

		setUser((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		await loginUser({ user }, setErrorMessage, setFormLoading);
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
					<Button
						icon='signup'
						content='login'
						type='submit'
						color='orange'
						disabled={!user && !password}
					/>
				</Segment>
			</Form>
			<FooterMessage />
		</>
	);
}

export default login;
