-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 10, 2025 at 02:33 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sambhasini`
--

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `inquiry_type` varchar(50) DEFAULT 'general',
  `status` varchar(20) DEFAULT 'new',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email_sent` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `subject`, `message`, `inquiry_type`, `status`, `created_at`, `updated_at`, `email_sent`) VALUES
('3cb87596-d982-4d8d-84aa-9b77d2f1084c', 'Suraj Yadav', 'sy.zethat@gmail.com', 'Test', 'test', 'support', 'new', '2025-10-09 07:37:28', '2025-10-09 07:37:31', 1),
('80a9d61c-6de5-4491-910a-8b403900deaf', 'Suraj Yadav', 'ersuraj097@gmail.com', 'Enterprise Plan Inquiry', 'Hello Jethat Team,\n\nI’m interested in learning more about your Enterprise Plan and its features. Could you please share details about pricing, customization options, and integration support for large-scale deployments?\n\nLooking forward to your response.\n\nBest regards,\nSuraj Yadav\nersuraj097@gmail.com', 'sales', 'new', '2025-10-09 12:12:20', '2025-10-09 12:12:22', 1),
('a5dc9bd6-a634-40a0-9d6a-b16134e9055a', 'Test User', 'sy.zethat@gmail.com', 'Test', 'test', 'sales', 'new', '2025-10-09 07:43:24', '2025-10-09 07:43:26', 1);

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` int(11) NOT NULL,
  `email` varchar(120) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otps`
--

INSERT INTO `otps` (`id`, `email`, `otp_code`, `expires_at`, `created_at`, `is_used`) VALUES
(10, 'bojaf43702@fintehs.com', '3172', '2025-10-09 08:38:02', '2025-10-09 08:33:02', 0),
(11, 'bojaf43702@fintehs.com', '5233', '2025-10-09 08:40:03', '2025-10-09 08:35:03', 0),
(12, 'ersuraj097@gmail.com', '9982', '2025-10-09 08:46:37', '2025-10-09 08:41:37', 0),
(28, 'sy.zethat@gmail.com', '8254', '2025-10-10 11:37:25', '2025-10-10 11:32:25', 0);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `training_status` varchar(20) DEFAULT NULL,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`config`)),
  `model_type` varchar(20) DEFAULT 'basic',
  `accuracy` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `chatbot_name` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `start_date` varchar(25) DEFAULT NULL,
  `end_date` varchar(25) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `chatbot_name`, `name`, `email`, `password`, `created_at`, `is_active`, `role`, `start_date`, `end_date`, `updated_at`) VALUES
('77d0687b-cbd3-43e0-92e8-bf314065d7cb', NULL, 'Suraj Yadav', 'sy.zethat111@gmail.com', 'scrypt:32768:8:1$5KQM4KRLF8QTSP68$fef7ddfc6845bf1aa3d935dd680b21a1dc743c259f064ae807fa1ce1b0f909eb4ec7de9cbd2d6c7a49b41df92cacfb4db790acf7426286bab39173acadf8421d', '2025-10-09 07:16:09', 1, 'user', NULL, NULL, '2025-10-10 17:42:36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_otps_email` (`email`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_users_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
