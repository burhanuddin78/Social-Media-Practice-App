import React from 'react';
import { Form, Header, Icon, Image, Segment } from 'semantic-ui-react';

function ImageDropDiv({ highlighted, setHighlighted, mediaPreview, setMediaPreview, setMedia, inputRef, handleChange }) {
	return (
		<>
			{' '}
			<Form.Field>
				<Segment>
					<input
						style={{ display: 'none' }}
						type='file'
						accept='image/*'
						onChange={handleChange}
						name='media'
						ref={inputRef}
					/>

					<div
						onDragOver={(e) => {
							e.preventDefault();
							setHighlighted(true);
						}}
						onDragLeave={(e) => {
							e.preventDefault();
							setHighlighted(false);
						}}
						onDrop={(e) => {
							e.preventDefault();
							setHighlighted(true);
							const droppedFile = Array.from(e.dataTransfer.files);
							setMedia(droppedFile[0]);
							setMediaPreview(URL.createObjectURL(droppedFile[0]));
						}}></div>

					<div>
						{mediaPreview == null ? (
							<>
								<Segment
									color={highlighted ? 'green' : ''}
									placeholder
									basic>
									<Header icon>
										<Icon
											name='file image outline'
											style={{ cursor: 'pointer' }}
											onClick={() => inputRef.current.click()}
										/>
										Drag n Drop or click to Upload Image
									</Header>
								</Segment>
							</>
						) : (
							<>
								<Segment
									color='green'
									placeholder
									basic>
									<Image
										src={mediaPreview}
										size='medium'
										centered
										style={{ cursor: 'pointer' }}
										onClick={() => inputRef.current.click()}
									/>
								</Segment>
							</>
						)}
					</div>
				</Segment>
			</Form.Field>
		</>
	);
}

export default ImageDropDiv;