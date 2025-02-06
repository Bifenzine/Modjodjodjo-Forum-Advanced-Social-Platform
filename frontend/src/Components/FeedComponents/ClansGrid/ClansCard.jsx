import React from 'react';
import { Link } from 'react-router-dom';
import truncateUsername from '../../../Utils/Truncate';
import Avatar from '../../Avatar/Avatar';

const ClansCard = ({ clanID, clanName, clanPic }) => {
    return (
        <Link to={`/Clans/clan/${clanID}`} className="flex flex-col items-center">
            <Avatar ProfilePic={clanPic} username={clanName} />
            <span className="text-white text-xs font-light">{truncateUsername(clanName)}</span>
        </Link>
    );
}

export default ClansCard;
