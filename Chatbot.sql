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
-- Database: `Chatbot`
--

-- --------------------------------------------------------

--
-- Table structure for table `Address`
--

CREATE TABLE `Address` (
  `id` int(11) NOT NULL,
  `name` int(11) NOT NULL,
  `email` int(11) NOT NULL,
  `mobile` int(11) NOT NULL,
  `address` int(11) NOT NULL,
  `pincode` int(11) NOT NULL,
  `state` int(11) NOT NULL,
  `country` int(11) NOT NULL,
  `add_date` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Feedback`
--

CREATE TABLE `Feedback` (
  `id` int(11) NOT NULL,
  `token_id` int(11) NOT NULL,
  `name` int(11) NOT NULL,
  `email` int(11) NOT NULL,
  `feedback` text NOT NULL,
  `date` int(11) NOT NULL,
  `time` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Invoice`
--

CREATE TABLE `Invoice` (
  `id` int(11) NOT NULL,
  `invoice_number` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `name` int(11) NOT NULL,
  `email` int(11) NOT NULL,
  `phone` int(11) NOT NULL,
  `gst` int(11) NOT NULL,
  `address` int(11) NOT NULL,
  `state` int(11) NOT NULL,
  `pin` int(11) NOT NULL,
  `country` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `time` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Log`
--

CREATE TABLE `Log` (
  `id` int(11) NOT NULL,
  `token_id` int(11) NOT NULL,
  `email` int(11) NOT NULL,
  `activity` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `time` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Order`
--

CREATE TABLE `Order` (
  `id` int(11) NOT NULL,
  `order_id` varchar(25) NOT NULL,
  `name` int(11) NOT NULL,
  `email` int(11) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `gst` varchar(15) NOT NULL,
  `address` varchar(250) NOT NULL,
  `state` varchar(50) NOT NULL,
  `pin` int(11) NOT NULL,
  `country` varchar(25) NOT NULL,
  `status` varchar(15) NOT NULL,
  `date` varchar(25) NOT NULL,
  `time` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Otp`
--

CREATE TABLE `Otp` (
  `id` int(11) NOT NULL,
  `otp` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Subscription`
--

CREATE TABLE `Subscription` (
  `id` int(11) NOT NULL,
  `token_id` int(11) NOT NULL,
  `email` int(11) NOT NULL,
  `start_date` int(11) NOT NULL,
  `end_date` int(11) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `id_token` varchar(350) NOT NULL,
  `chatbot_name` varchar(25) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(75) NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `password` text NOT NULL,
  `created_at` varchar(25) NOT NULL,
  `is_active` int(11) NOT NULL DEFAULT 0,
  `sub_type` varchar(25) DEFAULT NULL,
  `start_date` varchar(25) DEFAULT NULL,
  `end_date` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Address`
--
ALTER TABLE `Address`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Invoice`
--
ALTER TABLE `Invoice`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Order`
--
ALTER TABLE `Order`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Otp`
--
ALTER TABLE `Otp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Subscription`
--
ALTER TABLE `Subscription`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `id_token` (`id_token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Address`
--
ALTER TABLE `Address`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Invoice`
--
ALTER TABLE `Invoice`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Order`
--
ALTER TABLE `Order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Otp`
--
ALTER TABLE `Otp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Subscription`
--
ALTER TABLE `Subscription`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
