import React from 'react';
import { Menu } from 'semantic-ui-react';

function ProfileMenuTabs({ activeItem, handleItemClick, followersLength, followingLength, ownAccount, loggedUserFollowStats }) {
	return (
		<>
			<Menu
				pointing
				secondary>
				<Menu.Item
					name='profile'
					activeItem={activeItem == 'profile'}
					onClick={() => handleItemClick('profile')}
				/>
				{ownAccount ? (
					<>
						<Menu.Item
							name={`${loggedUserFollowStats.followers.length > 0 ? loggedUserFollowStats.followers.length : 0} Followers`}
							activeItem={activeItem == 'followers'}
							onClick={() => handleItemClick('followers')}
						/>
						<Menu.Item
							name={`${loggedUserFollowStats.following.length > 0 ? loggedUserFollowStats.following.length : 0} Following`}
							activeItem={activeItem == 'following'}
							onClick={() => handleItemClick('following')}
						/>
					</>
				) : (
					<>
						<Menu.Item
							name={`${followersLength} Followers`}
							activeItem={activeItem == 'followers'}
							onClick={() => handleItemClick('followers')}
						/>
						<Menu.Item
							name={`${followingLength} Following`}
							activeItem={activeItem == 'following'}
							onClick={() => handleItemClick('following')}
						/>
					</>
				)}

				{ownAccount && (
					<>
						<Menu.Item
							name='updateProfile'
							activeItem={activeItem == 'updateProfile'}
							onClick={() => handleItemClick('updateProfile')}
						/>
						<Menu.Item
							name='settings'
							activeItem={activeItem == 'settings'}
							onClick={() => handleItemClick('settings')}
						/>
					</>
				)}
			</Menu>
		</>
	);
}

export default ProfileMenuTabs;
