import * as mongo from 'mongodb';
import User, { IRemoteUser } from '../../../../models/user';
import config from '../../../../config';
import reject from '../../../../services/following/requests/reject';
import { IFollow } from '../../type';

export default async (actor: IRemoteUser, activity: IFollow): Promise<void> => {
	const id = typeof activity.actor == 'string' ? activity.actor : activity.actor.id;

	if (!id.startsWith(config.url + '/')) {
		return null;
	}

	const follower = await User.findOne({
		_id: new mongo.ObjectID(id.split('/').pop())
	});

	if (follower === null) {
		throw new Error('follower not found');
	}

	if (follower.host != null) {
		throw new Error('フォローリクエストしたユーザーはローカルユーザーではありません');
	}

	await reject(actor, follower);
};
