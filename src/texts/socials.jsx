import React from 'react';
import { 
  FaInstagram, 
  FaGithub, 
  FaTelegramPlane, 
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaDiscord,
  FaYoutube,
  FaTiktok,
  FaDribbble,
  FaBehance
} from 'react-icons/fa';
import { SiCodepen } from 'react-icons/si';

// Custom icon component example (you can create your own custom icons)
const CustomVKIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 16.611h-1.616c-.607 0-.793-.583-1.879-1.674-1.414-1.297-1.6-.311-1.6.311v1.062c0 .311-.169.311-.677.311-1.12 0-2.36-.062-3.686-1.385-1.946-1.948-2.822-4.337-2.822-4.337s-.077-.169.058-.262c.169-.093.624-.093.624-.093l1.655-.008c.155 0 .271.093.348.264.155.342.466.947.854 1.532.776 1.192.932.7.932-.335V10.34c0-.7-.466-.777-.466-.777-.349-.095-.31-.325 0-.404 0 0 .62-.093 1.24-.062.466 0 .932.078 1.353.156.193.03.312.155.312.404-.039 1.28-.039 1.994.583 2.242.348.108.66-.108.66-.108 1.163-.68 1.994-2.398 1.994-2.398.077-.155.232-.233.387-.233l1.772-.008c.466 0 .7.078.7.404 0 0-.698 1.478-1.73 2.707-.892 1.073-.892 1.073-.272 1.761.581.661 1.575 1.615 1.7 1.761.7.7.194.35.7.661-.02.062.155.312-.087.312z" />
  </svg>
);

// This array contains all your social media profiles
// You can add as many as you want - the component will handle them
export const socials = [
  {
    platform: 'Instagram',
    username: '@german_progq',
    url: 'https://instagram.com/german_progq',
    icon: <FaInstagram />,
    color: '#E1306C'
  },
  {
    platform: 'GitHub',
    username: '@germanProgq',
    url: 'https://github.com/germanProgq',
    icon: <FaGithub />,
    color: '#333333'
  },
  {
    platform: 'Telegram',
    username: '@girsh_vinok',
    url: 'https://t.me/girsh_vinok',
    icon: <FaTelegramPlane />,
    color: '#0088cc'
  },
//   {
//     platform: 'Facebook',
//     username: '@yourusername',
//     url: 'https://facebook.com/yourusername',
//     icon: <FaFacebookF />,
//     color: '#1877F2'
//   },
  {
    platform: 'Twitter',
    username: '@GermanVinokurov',
    url: 'https://x.com/GermanVinokurov',
    icon: <FaTwitter />,
    color: '#1DA1F2'
  },
  {
    platform: 'LinkedIn',
    username: 'German Vinokurov',
    url: 'https://www.linkedin.com/in/german-vinokurov-300b26320/',
    icon: <FaLinkedinIn />,
    color: '#0077B5'
  },
  {
    platform: 'VK',
    username: '@girsh_vinok',
    url: 'https://vk.com/girsh_vinok',
    icon: <CustomVKIcon />,
    color: '#4C75A3'
  },
  {
    platform: 'Discord',
    username: 'eeh_',
    url: 'https://discord.gg/tmwpEbPmqH',
    icon: <FaDiscord />,
    color: '#5865F2'
  },
  {
    platform: 'YouTube',
    username: '@selectronxD',
    url: 'https://www.youtube.com/@selectronxD',
    icon: <FaYoutube />,
    color: '#FF0000'
  },
//   {
//     platform: 'TikTok',
//     username: '@yourusername',
//     url: 'https://tiktok.com/@yourusername',
//     icon: <FaTiktok />,
//     color: '#000000'
//   },
  {
    platform: 'CodePen',
    username: '@germanProgq',
    url: 'https://codepen.io/germanProgq',
    icon: <SiCodepen />,
    color: '#000000'
  },
//   {
//     platform: 'Dribbble',
//     username: '@yourusername',
//     url: 'https://dribbble.com/yourusername',
//     icon: <FaDribbble />,
//     color: '#EA4C89'
//   },
//   {
//     platform: 'Behance',
//     username: '@yourusername',
//     url: 'https://behance.net/yourusername',
//     icon: <FaBehance />,
//     color: '#1769FF'
//   }
];

// Optional: export additional information for your contact page
export const contactInfo = {
  email: 'gvinok@outlook.com',
  phone: '+7 (985) 143-7305',
  location: 'Herzliya, Israel'
};

export const preferredContact = 'email';