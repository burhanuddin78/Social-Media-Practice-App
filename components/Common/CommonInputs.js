import react from 'react';
import { Form, Button, Message, Segment, TextArea, Divider } from 'semantic-ui-react';

function CommonInputs({ user: { bio, facebook, instagram, youtube, twitter }, handleChange, setShowSocialLinks, showSocialLinks }) {
	const handleSocialLinks = () => {
		setShowSocialLinks(!showSocialLinks);
	};
	return (
		<>
			<Form.Field
				required
				control={TextArea}
				name='bio'
				value={bio}
				onChange={handleChange}
				placeholder='bio'
			/>

			<Button
				content='Add Social Links'
				color='red'
				icon='at'
				type='button'
				onClick={handleSocialLinks}
			/>

			{showSocialLinks && (
				<>
					<Divider />
					<Form.Input
						icon='facebook f'
						iconPosition='left'
						name='facebook'
						value={facebook}
						onChange={handleChange}
					/>
					<Form.Input
						icon='facebook f'
						iconPosition='left'
						name='facebook'
						value={facebook}
						onChange={handleChange}
					/>
					<Form.Input
						icon='twitter'
						iconPosition='left'
						name='twitter'
						value={twitter}
						onChange={handleChange}
					/>
					<Form.Input
						icon='instagram'
						iconPosition='left'
						name='instagram'
						value={twitter}
						onChange={handleChange}
					/>

					<Form.Input
						icon='youtube'
						iconPosition='left'
						name='youtube'
						value={youtube}
						onChange={handleChange}
					/>

					<Message
						icon='attention'
						info
						size='small'
						header='Social Media Links Are Optional'
					/>
				</>
			)}
		</>
	);
}
export default CommonInputs;
