-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 04, 2025 at 04:45 AM
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
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `subscription_id` varchar(36) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `amount` float NOT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `due_date` datetime NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `user_id`, `subscription_id`, `order_id`, `invoice_number`, `amount`, `currency`, `status`, `due_date`, `paid_at`, `created_at`, `updated_at`) VALUES
('002ab7ac-82c2-42a3-a38e-0b0a7edc7259', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', NULL, NULL, 'INV_TEST_001', 100, 'USD', 'paid', '2025-11-03 17:47:59', '2025-11-03 17:47:59', '2025-11-03 17:47:59', '2025-11-03 17:47:59'),
('0ec7baf6-de8b-46ce-914e-34f99ccac56a', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '5da70b06-277f-4bbc-af19-5408d98caa25', '005636b7-6fb5-4fc9-be9e-faadab7ac6f7', 'INV_4D2B8DD39BB0', 999, 'INR', 'unpaid', '2026-11-04 03:15:39', NULL, '2025-11-04 03:15:39', '2025-11-04 03:15:39'),
('247a972b-141a-442d-a516-9855b98434a1', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', 'f7ef6c22-da31-4f35-8e03-cb645f0fb53c', 'eb5d3f24-9345-41ed-b501-1469d1015257', 'INV_B61E74C1B681', 999, 'INR', 'unpaid', '2026-11-04 03:33:34', NULL, '2025-11-04 03:33:34', '2025-11-04 03:33:34'),
('9d416eb2-72bb-46d9-888a-51a00ba8ceb5', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', 'eba932fe-04e7-4d99-abae-effb7146abae', '10680ccb-43f2-460f-acbc-accbe5f585cf', 'INV_CFB612E7C33C', 999, 'INR', 'unpaid', '2026-11-04 03:34:53', NULL, '2025-11-04 03:34:53', '2025-11-04 03:34:53'),
('cbd02972-26ca-4aca-a6da-f4fc49e17412', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '31e2a4f1-828b-4b90-a710-5dec87f11991', '820c13ab-6f61-404f-8a0e-2c92bbf9421e', 'INV_B00451976DF4', 999, 'INR', 'unpaid', '2026-11-04 03:26:59', NULL, '2025-11-04 03:26:59', '2025-11-04 03:26:59'),
('d1f1ce8b-d853-46a6-8b23-a351c113e55a', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '6504c710-1063-448f-808a-75b19ce9badd', 'dc84ae3e-d03b-41d6-8dcb-795880f291eb', 'INV_69F8B2235103', 999, 'INR', 'unpaid', '2026-11-04 03:30:17', NULL, '2025-11-04 03:30:17', '2025-11-04 03:30:17'),
('ee663068-5f2f-4ca9-bec6-d3729cf7cfce', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '4fee2b4d-ad6a-4044-a134-2483dd3e5b32', 'a4c8e5af-cd2e-4173-bbcb-f4817f12854f', 'INV_183ADA56E22D', 999, 'INR', 'unpaid', '2026-11-03 18:21:53', NULL, '2025-11-03 18:21:53', '2025-11-03 18:21:53');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `subscription_id` varchar(36) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `total_amount` float NOT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `subscription_id`, `order_number`, `total_amount`, `currency`, `status`, `payment_status`, `created_at`, `updated_at`) VALUES
('005636b7-6fb5-4fc9-be9e-faadab7ac6f7', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '5da70b06-277f-4bbc-af19-5408d98caa25', 'ORD_FC334DE647A8', 999, 'INR', 'pending', 'unpaid', '2025-11-04 03:15:39', '2025-11-04 03:15:39'),
('10680ccb-43f2-460f-acbc-accbe5f585cf', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', 'eba932fe-04e7-4d99-abae-effb7146abae', 'ORD_2913CB301828', 999, 'INR', 'pending', 'unpaid', '2025-11-04 03:34:53', '2025-11-04 03:34:53'),
('7c6378e1-431b-428a-9930-9f9144710536', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', NULL, 'ORD_TEST_001', 100, 'USD', 'completed', 'paid', '2025-11-03 17:47:59', '2025-11-03 17:47:59'),
('820c13ab-6f61-404f-8a0e-2c92bbf9421e', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '31e2a4f1-828b-4b90-a710-5dec87f11991', 'ORD_5C101A4A31B6', 999, 'INR', 'pending', 'unpaid', '2025-11-04 03:26:59', '2025-11-04 03:26:59'),
('a4c8e5af-cd2e-4173-bbcb-f4817f12854f', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '4fee2b4d-ad6a-4044-a134-2483dd3e5b32', 'ORD_7BD7E4E56450', 999, 'INR', 'pending', 'unpaid', '2025-11-03 18:21:53', '2025-11-03 18:21:53'),
('dc84ae3e-d03b-41d6-8dcb-795880f291eb', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '6504c710-1063-448f-808a-75b19ce9badd', 'ORD_7228DC1AF105', 999, 'INR', 'pending', 'unpaid', '2025-11-04 03:30:17', '2025-11-04 03:30:17'),
('eb5d3f24-9345-41ed-b501-1469d1015257', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', 'f7ef6c22-da31-4f35-8e03-cb645f0fb53c', 'ORD_253D8F3F141D', 999, 'INR', 'pending', 'unpaid', '2025-11-04 03:33:34', '2025-11-04 03:33:34');

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
(31, 'sy.zethat@gmail.com', '5999', '2025-10-15 07:08:23', '2025-10-15 07:03:23', 0),
(33, 'ersuraj097@gmail.com', '1933', '2025-10-29 18:14:38', '2025-10-29 18:09:38', 1);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `transaction_id` varchar(100) NOT NULL,
  `amount` float NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `status` varchar(20) DEFAULT 'completed',
  `payment_method` varchar(50) DEFAULT 'card',
  `billing_street` varchar(255) DEFAULT NULL,
  `billing_city` varchar(100) DEFAULT NULL,
  `billing_state` varchar(100) DEFAULT NULL,
  `billing_zip_code` varchar(20) DEFAULT NULL,
  `billing_country` varchar(100) DEFAULT NULL,
  `card_last_four` varchar(4) DEFAULT NULL,
  `card_brand` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paytm_order_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `project_id`, `transaction_id`, `amount`, `currency`, `status`, `payment_method`, `billing_street`, `billing_city`, `billing_state`, `billing_zip_code`, `billing_country`, `card_last_four`, `card_brand`, `created_at`, `updated_at`, `paytm_order_id`) VALUES
('10953531-46a9-4462-96fe-8de796e134ed', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '4eeaff3a-8e5c-4b00-8eb5-49392224f58f', 'ORDER_65C91BEA519A4814', 1599, 'INR', 'failed', 'paytm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 17:23:31', '2025-11-03 17:23:51', 'ORDER_65C91BEA519A4814'),
('3226c4ff-711c-4737-9fcc-f88980396ecf', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '9546d3a3-dae4-4976-b11c-454c7801fff3', 'ORDER_A4EEB935FBC2480A', 1599, 'INR', 'failed', 'paytm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 03:17:44', '2025-11-04 03:18:03', 'ORDER_A4EEB935FBC2480A'),
('63fcb46c-aed6-4e68-a42c-24c15b651ed7', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '35997b01-5aee-4cf5-bbc4-6a8b22914754', 'txn_E723B81B17F2444E', 999, 'USD', 'completed', 'card', 'VILLAGE PATNA POST PATNA BLOCK BARHALGANJ DISTRICT GORAKHPUR', 'GORAKHPUR', 'Uttar Pradesh', '273402', 'India', '3456', 'unknown', '2025-11-04 03:35:10', '2025-11-04 03:35:10', NULL),
('8373588d-9034-4669-a745-7af70033e05a', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '64184483-7833-4002-8570-ecbcef752f09', 'ORDER_E610D59BB5854B9B', 1599, 'INR', 'failed', 'paytm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 18:22:01', '2025-11-03 18:22:16', 'ORDER_E610D59BB5854B9B'),
('ccc94334-cfab-426f-a9d1-9930587669cf', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '4eeaff3a-8e5c-4b00-8eb5-49392224f58f', 'ORDER_A21B04EECAA24DDA', 1599, 'INR', 'pending', 'paytm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 17:23:08', '2025-11-03 17:23:08', 'ORDER_A21B04EECAA24DDA'),
('cdbed8cf-4f01-446c-a8c4-02cb5e3685e8', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '1195f949-e0c8-4226-87df-00d39271387b', 'ORDER_CC50C7A6D235414E', 1599, 'INR', 'failed', 'paytm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 18:11:09', '2025-11-03 18:11:25', 'ORDER_CC50C7A6D235414E');

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
  `accuracy` float DEFAULT 0,
  `payment_status` varchar(20) DEFAULT 'unpaid'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `type`, `description`, `user_id`, `created_at`, `updated_at`, `status`, `training_status`, `config`, `model_type`, `accuracy`, `payment_status`) VALUES
('1195f949-e0c8-4226-87df-00d39271387b', 'api_key', 'customer_support', 'Specialized for handling customer inquiries and support tickets', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '2025-11-03 18:10:59', '2025-11-03 18:11:03', 'draft', 'not_trained', '{\"greeting_enabled\": true, \"greeting_message\": \"Hello! How can I help you today?\", \"position\": \"bottom-right\", \"avatar\": \"default\", \"bot_name\": \"Assistant\", \"agent_role\": \"customer_support\", \"chattiness\": \"standard\", \"language\": \"en\", \"theme_color\": \"#667eea\", \"background_type\": \"gradient\", \"font_family\": \"Inter\", \"bubble_style\": \"rounded\", \"button_color\": \"#667eea\", \"icon_color\": \"#ffffff\"}', 'medium', 0, 'unpaid'),
('13319fe9-e5f0-459e-9eb0-5421de4e46b9', 'Hilario Hickle', 'customer_support', 'Specialized for handling customer inquiries and support tickets', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '2025-11-04 03:33:34', '2025-11-04 03:33:37', 'draft', 'not_trained', '{\"greeting_enabled\": true, \"greeting_message\": \"Hello! How can I help you today?\", \"position\": \"bottom-right\", \"avatar\": \"default\", \"bot_name\": \"Assistant\", \"agent_role\": \"customer_support\", \"chattiness\": \"standard\", \"language\": \"en\", \"theme_color\": \"#667eea\", \"background_type\": \"gradient\", \"font_family\": \"Inter\", \"bubble_style\": \"rounded\", \"button_color\": \"#667eea\", \"icon_color\": \"#ffffff\"}', 'basic', 0, 'unpaid'),
('35997b01-5aee-4cf5-bbc4-6a8b22914754', 'Hilario Hickle', 'customer_support', 'Specialized for handling customer inquiries and support tickets', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '2025-11-04 03:34:53', '2025-11-04 03:34:56', 'draft', 'not_trained', '{\"greeting_enabled\": true, \"greeting_message\": \"Hello! How can I help you today?\", \"position\": \"bottom-right\", \"avatar\": \"default\", \"bot_name\": \"Assistant\", \"agent_role\": \"customer_support\", \"chattiness\": \"standard\", \"language\": \"en\", \"theme_color\": \"#667eea\", \"background_type\": \"gradient\", \"font_family\": \"Inter\", \"bubble_style\": \"rounded\", \"button_color\": \"#667eea\", \"icon_color\": \"#ffffff\"}', 'basic', 0, 'unpaid'),
('4eeaff3a-8e5c-4b00-8eb5-49392224f58f', 'Hilario Hickle', 'customer_support', 'Specialized for handling customer inquiries and support tickets', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '2025-11-03 17:23:01', '2025-11-03 17:47:59', 'draft', 'not_trained', '{\"greeting_enabled\": true, \"greeting_message\": \"Hello! How can I help you today?\", \"position\": \"bottom-right\", \"avatar\": \"default\", \"bot_name\": \"Assistant\", \"agent_role\": \"customer_support\", \"chattiness\": \"standard\", \"language\": \"en\", \"theme_color\": \"#667eea\", \"background_type\": \"gradient\", \"font_family\": \"Inter\", \"bubble_style\": \"rounded\", \"button_color\": \"#667eea\", \"icon_color\": \"#ffffff\"}', 'medium', 0, 'paid'),
('540a7413-60e3-4ad0-a47c-d73c2a8b6095', 'Hilario Hickle', 'entertainment', 'Fun and engaging chatbot for entertainment purposes', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '2025-11-04 03:30:17', '2025-11-04 03:30:20', 'draft', 'not_trained', '{\"greeting_enabled\": true, \"greeting_message\": \"Hello! How can I help you today?\", \"position\": \"bottom-right\", \"avatar\": \"default\", \"bot_name\": \"Assistant\", \"agent_role\": \"customer_support\", \"chattiness\": \"standard\", \"language\": \"en\", \"theme_color\": \"#667eea\", \"background_type\": \"gradient\", \"font_family\": \"Inter\", \"bubble_style\": \"rounded\", \"button_color\": \"#667eea\", \"icon_color\": \"#ffffff\"}', 'medium', 0, 'unpaid'),
('64184483-7833-4002-8570-ecbcef752f09', 'M Pandey', 'educational', 'Interactive learning assistant for educational content', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '2025-11-03 18:21:53', '2025-11-03 18:21:55', 'draft', 'not_trained', '{\"greeting_enabled\": true, \"greeting_message\": \"Hello! How can I help you today?\", \"position\": \"bottom-right\", \"avatar\": \"default\", \"bot_name\": \"Assistant\", \"agent_role\": \"customer_support\", \"chattiness\": \"standard\", \"language\": \"en\", \"theme_color\": \"#667eea\", \"background_type\": \"gradient\", \"font_family\": \"Inter\", \"bubble_style\": \"rounded\", \"button_color\": \"#667eea\", \"icon_color\": \"#ffffff\"}', 'medium', 0, 'paid'),
('9546d3a3-dae4-4976-b11c-454c7801fff3', 'videocallapp', 'customer_support', 'Specialized for handling customer inquiries and support tickets', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '2025-11-04 03:15:39', '2025-11-04 03:15:42', 'draft', 'not_trained', '{\"greeting_enabled\": true, \"greeting_message\": \"Hello! How can I help you today?\", \"position\": \"bottom-right\", \"avatar\": \"default\", \"bot_name\": \"Assistant\", \"agent_role\": \"customer_support\", \"chattiness\": \"standard\", \"language\": \"en\", \"theme_color\": \"#667eea\", \"background_type\": \"gradient\", \"font_family\": \"Inter\", \"bubble_style\": \"rounded\", \"button_color\": \"#667eea\", \"icon_color\": \"#ffffff\"}', 'medium', 0, 'unpaid'),
('9816cac7-d140-4ded-8883-d50835644aca', 'Hilario Hickle', 'customer_support', 'Specialized for handling customer inquiries and support tickets', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '2025-11-04 03:26:59', '2025-11-04 03:27:02', 'draft', 'not_trained', '{\"greeting_enabled\": true, \"greeting_message\": \"Hello! How can I help you today?\", \"position\": \"bottom-right\", \"avatar\": \"default\", \"bot_name\": \"Assistant\", \"agent_role\": \"customer_support\", \"chattiness\": \"standard\", \"language\": \"en\", \"theme_color\": \"#667eea\", \"background_type\": \"gradient\", \"font_family\": \"Inter\", \"bubble_style\": \"rounded\", \"button_color\": \"#667eea\", \"icon_color\": \"#ffffff\"}', 'medium', 0, 'unpaid');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `plan_type` varchar(20) DEFAULT 'basic',
  `model_type` varchar(20) DEFAULT 'basic',
  `token_id` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `amount` float DEFAULT 0,
  `currency` varchar(3) DEFAULT 'INR',
  `billing_cycle` varchar(20) DEFAULT 'monthly',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `next_billing_date` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `project_id`, `plan_type`, `model_type`, `token_id`, `email`, `amount`, `currency`, `billing_cycle`, `start_date`, `end_date`, `next_billing_date`, `status`, `created_at`, `updated_at`) VALUES
('31e2a4f1-828b-4b90-a710-5dec87f11991', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '9816cac7-d140-4ded-8883-d50835644aca', 'basic', 'basic', 'SUB_6517CBB5962843C0', 'ersuraj097@gmail.com', 999, 'INR', 'yearly', '2025-11-04 03:26:59', '2026-11-04 03:26:59', NULL, 'pending', '2025-11-04 03:26:59', '2025-11-04 03:26:59'),
('4fee2b4d-ad6a-4044-a134-2483dd3e5b32', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '64184483-7833-4002-8570-ecbcef752f09', 'basic', 'basic', 'SUB_B114D92B567C4B47', 'ersuraj097@gmail.com', 999, 'INR', 'yearly', '2025-11-03 18:21:53', '2026-11-03 18:21:53', NULL, 'pending', '2025-11-03 18:21:53', '2025-11-03 18:21:53'),
('5da70b06-277f-4bbc-af19-5408d98caa25', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '9546d3a3-dae4-4976-b11c-454c7801fff3', 'basic', 'basic', 'SUB_505A7B27BEA6483C', 'ersuraj097@gmail.com', 999, 'INR', 'yearly', '2025-11-04 03:15:39', '2026-11-04 03:15:39', NULL, 'pending', '2025-11-04 03:15:39', '2025-11-04 03:15:39'),
('6504c710-1063-448f-808a-75b19ce9badd', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '540a7413-60e3-4ad0-a47c-d73c2a8b6095', 'basic', 'basic', 'SUB_766588B5FF1D416C', 'ersuraj097@gmail.com', 999, 'INR', 'yearly', '2025-11-04 03:30:17', '2026-11-04 03:30:17', NULL, 'pending', '2025-11-04 03:30:17', '2025-11-04 03:30:17'),
('a01852fd-f26e-4684-aa6c-5a0b6b37e41f', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '4eeaff3a-8e5c-4b00-8eb5-49392224f58f', 'basic', 'basic', 'test-token', 'ersuraj097@gmail.com', 100, 'USD', 'monthly', '2025-11-03 17:47:59', '2025-11-03 17:47:59', NULL, 'active', '2025-11-03 17:47:59', '2025-11-03 17:47:59'),
('eba932fe-04e7-4d99-abae-effb7146abae', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '35997b01-5aee-4cf5-bbc4-6a8b22914754', 'basic', 'basic', 'SUB_E3EE6A48C01846D0', 'ersuraj097@gmail.com', 999, 'INR', 'yearly', '2025-11-04 03:34:53', '2026-11-04 03:34:53', NULL, 'pending', '2025-11-04 03:34:53', '2025-11-04 03:34:53'),
('f7ef6c22-da31-4f35-8e03-cb645f0fb53c', '1db6da8f-6cba-4ed4-a3be-e242c6d37600', '13319fe9-e5f0-459e-9eb0-5421de4e46b9', 'basic', 'basic', 'SUB_026F1C4D2E084A23', 'ersuraj097@gmail.com', 999, 'INR', 'yearly', '2025-11-04 03:33:34', '2026-11-04 03:33:34', NULL, 'pending', '2025-11-04 03:33:34', '2025-11-04 03:33:34');

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
('1db6da8f-6cba-4ed4-a3be-e242c6d37600', NULL, 'Suraj Yadav', 'ersuraj097@gmail.com', 'scrypt:32768:8:1$46OKW7lSzZUMOliX$82311e422f025629127f43250c15708aeb6afd565356da671827967baa5870ad3e8d96775bd9ad4ff9c1728147915be71ad621b2493e0df3479374160f012306', '2025-10-29 18:11:13', 1, 'user', NULL, NULL, '2025-10-29 18:11:13'),
('77d0687b-cbd3-43e0-92e8-bf314065d7cb', NULL, 'Suraj Yadav', 'sy.zethat111@gmail.com', 'scrypt:32768:8:1$5KQM4KRLF8QTSP68$fef7ddfc6845bf1aa3d935dd680b21a1dc743c259f064ae807fa1ce1b0f909eb4ec7de9cbd2d6c7a49b41df92cacfb4db790acf7426286bab39173acadf8421d', '2025-10-09 07:16:09', 1, 'user', NULL, NULL, '2025-10-10 17:42:36'),
('d9819836-706f-4738-847c-d4add0c21073', NULL, 'Suraj Yadav', 'sy.zethat@gmail.com', 'scrypt:32768:8:1$m4wYrgJZAMktEBgg$affcb13ff3ab2c2d8657d78eb49ea9ec05ad9890d6588b0b702ee39753d66ce7efaa5eb4c33bde144e1406c7f045fa1c300d011507ec01e6bcb1ba2242b8362d', '2025-10-13 18:04:14', 1, 'user', NULL, NULL, '2025-10-29 18:01:28');

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
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_otps_email` (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD UNIQUE KEY `paytm_order_id` (`paytm_order_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_id` (`token_id`),
  ADD KEY `ix_subscriptions_email` (`email`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

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
