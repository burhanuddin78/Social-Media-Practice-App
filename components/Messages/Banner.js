import React from 'react';
import { Grid, Image, Segment } from 'semantic-ui-react';

function Banner({ bannerData }) {
	const { name, profilePicUrl } = bannerData;

	return (
		<>
			<Segment
				color='teal'
				attached='top'>
				<Grid>
					<Grid.Column
						floated='left'
						width={14}>
						<h4>
							<Image
								src={profilePicUrl}
								avatar
							/>
							{name}
						</h4>
					</Grid.Column>
				</Grid>
			</Segment>
		</>
	);
}

export default Banner;
