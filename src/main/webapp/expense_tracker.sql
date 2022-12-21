-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 21, 2022 at 10:42 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `expense_tracker`
--

-- --------------------------------------------------------

--
-- Table structure for table `bank_wallet`
--

CREATE TABLE `bank_wallet` (
  `id` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL,
  `note` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bank_wallet`
--

INSERT INTO `bank_wallet` (`id`, `wallet_id`, `note`) VALUES
(1, 1, ''),
(3, 20, 'null');

-- --------------------------------------------------------

--
-- Table structure for table `bonus_wallet`
--

CREATE TABLE `bonus_wallet` (
  `id` bigint(20) NOT NULL,
  `note` varchar(500) NOT NULL,
  `wallet_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bonus_wallet`
--

INSERT INTO `bonus_wallet` (`id`, `note`, `wallet_id`) VALUES
(1, 'Zoho Diwali Bonus Card', 6),
(6, '', 11);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) NOT NULL,
  `image_path` varchar(100) NOT NULL,
  `name` varchar(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `image_path`, `name`, `user_id`) VALUES
(1, 'f0f9', 'Food', 1),
(2, 'f641', 'Clothes', 1),
(3, 'f641', 'Lowe', 1),
(4, 'f13d', 'Burrito', 1),
(5, 'f641', 'sdtgsdg', 1),
(6, 'f84a', 'Travel', 1);

-- --------------------------------------------------------

--
-- Table structure for table `credit_card_wallet`
--

CREATE TABLE `credit_card_wallet` (
  `id` bigint(20) NOT NULL,
  `repay_date` int(11) NOT NULL,
  `limit` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `credit_card_wallet`
--

INSERT INTO `credit_card_wallet` (`id`, `repay_date`, `limit`, `wallet_id`) VALUES
(1, 30, 10000, 3),
(2, 30, 12000, 4),
(3, 30, 12000, 13),
(4, 30, 10000, 14),
(5, 30, 12000, 15);

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) NOT NULL,
  `spend_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category_id` bigint(20) NOT NULL,
  `reason` varchar(100) NOT NULL,
  `note` varchar(500) NOT NULL,
  `transaction_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `spend_on`, `category_id`, `reason`, `note`, `transaction_id`) VALUES
(11, '2022-12-12 10:31:03', 2, 'Dummy', '', 11),
(13, '2022-12-12 11:33:03', 4, 'Car', '', 13),
(15, '2022-12-13 11:33:03', 1, 'Phone', '', 15),
(16, '2022-12-13 11:33:03', 1, 'Brush', '', 16),
(17, '2022-12-12 11:43:03', 3, 'Pen', '', 17),
(18, '2022-12-13 10:08:03', 4, 'Clothes', '', 18),
(19, '2022-12-12 11:44:03', 2, 'Pencil', '', 19),
(20, '2022-12-11 12:14:03', 0, 'Watch', '', 20),
(21, '2022-12-10 12:15:03', 0, 'Mobile', '', 21),
(22, '2022-12-10 13:16:03', 0, 'Clothes 123', '', 22),
(23, '2022-12-10 13:16:03', 0, 'Sample 231', '', 23),
(24, '2022-12-09 13:16:03', 0, 'Sample Cobs', '', 24),
(25, '2022-12-08 13:17:03', 0, 'Hello 2o', '', 25),
(26, '2022-12-08 13:17:03', 0, 'Hellosdf', '', 26),
(27, '2022-12-08 13:17:03', 0, 'Sample Cor', '', 27),
(30, '2022-11-17 11:29:03', 0, 'Hello', '', 30),
(31, '2022-11-16 11:32:03', 0, 'Clothes', '', 31),
(36, '2022-12-14 18:01:03', 0, 'Dinner', '', 36),
(67, '2022-12-15 13:22:03', 1, 'network', '', 69),
(68, '2022-12-15 11:45:03', 2, 'Socks', '', 70),
(69, '2022-12-15 11:44:03', 4, 'Shoes', '', 71),
(70, '2022-12-14 18:28:03', 4, 'Sample 12', '', 72),
(71, '2022-12-14 18:21:03', 0, '4asf1335', '', 73),
(72, '2022-12-14 18:08:03', 0, 'Dummy 3', '', 74),
(73, '2022-12-14 18:02:03', 0, 'Watch 1', '', 75),
(74, '2022-12-14 04:48:03', 4, 'Food', '', 76),
(75, '2022-12-14 11:35:03', 5, 'fgjgf', '', 77),
(76, '2022-12-16 17:54:03', 3, 'Dummy', '', 78),
(77, '2022-12-14 18:04:03', 0, 'dfgfdg', '', 79),
(79, '2022-12-17 06:52:03', 0, 'sdgdsg', '', 81),
(82, '2022-12-17 06:52:03', 0, 'gjghk', '', 84),
(83, '2022-12-19 05:16:03', 0, 'Brush', '', 85),
(84, '2022-12-19 05:17:03', 0, 'Mouse', '', 86),
(85, '2022-12-19 05:18:03', 0, 'Mobile', '', 87),
(86, '2022-12-19 05:37:03', 0, 'Dress', '', 88),
(87, '2022-12-19 05:39:03', 0, 'Dress', '', 89),
(88, '2022-12-19 05:48:03', 0, 'New Belt', '', 90),
(103, '2022-12-19 05:59:03', 1, 'Hello', '', 105),
(105, '2022-12-19 05:54:03', 4, 'Expense Two', '', 107),
(106, '2022-12-19 05:53:03', 5, 'Sample Expens', '', 108),
(107, '2022-12-19 05:59:03', 0, 'Sample 2', 'Some note has been added', 109),
(110, '2022-12-19 06:00:03', 1, 'asfdf', '', 112),
(112, '2022-12-20 13:08:03', 0, 'Sample Expense', '', 114),
(114, '2022-12-21 04:43:03', 6, 'Travel Expenses', '', 116);

-- --------------------------------------------------------

--
-- Table structure for table `expense_split`
--

CREATE TABLE `expense_split` (
  `id` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL,
  `expense_id` bigint(20) NOT NULL,
  `amount` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `expense_split`
--

INSERT INTO `expense_split` (`id`, `wallet_id`, `expense_id`, `amount`) VALUES
(11, 1, 11, 123),
(13, 1, 13, 567),
(15, 1, 15, 120),
(16, 1, 16, 230),
(17, 1, 17, 12),
(18, 1, 18, 10),
(19, 1, 19, 213),
(20, 1, 20, 30),
(21, 1, 21, 19),
(22, 1, 22, 123),
(23, 1, 23, 123),
(24, 1, 24, 23),
(25, 1, 25, 23),
(26, 1, 26, 23),
(27, 1, 27, 23),
(30, 1, 30, 2),
(31, 1, 31, 123),
(36, 1, 36, 51),
(67, 11, 67, 100),
(68, -100, 68, 101),
(69, -100, 69, 100),
(70, -100, 70, 43),
(71, 14, 71, 23),
(72, 14, 72, 1),
(73, 12, 73, 100),
(74, -100, 74, 30),
(75, 20, 75, 56),
(76, 13, 76, 12),
(77, 13, 77, 45),
(79, 13, 79, 34),
(82, 13, 82, 67),
(83, 13, 83, 20),
(84, 13, 84, 12),
(85, 13, 85, 123),
(86, 13, 86, 10),
(87, 13, 87, 12),
(88, 13, 88, 150),
(103, 13, 103, 12),
(105, -100, 105, 10),
(106, 13, 106, 120),
(107, 13, 107, 12),
(110, 14, 110, 22),
(111, -100, 110, 20),
(113, 13, 112, 12),
(115, 13, 114, 120);

-- --------------------------------------------------------

--
-- Table structure for table `expense_tag_mapping`
--

CREATE TABLE `expense_tag_mapping` (
  `expense_id` bigint(20) NOT NULL,
  `tag_id` bigint(20) NOT NULL,
  `id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `expense_tag_mapping`
--

INSERT INTO `expense_tag_mapping` (`expense_id`, `tag_id`, `id`) VALUES
(15, 1, 1),
(15, 2, 2),
(15, 3, 3),
(16, 1, 4),
(16, 2, 5),
(16, 3, 6),
(17, 1, 7),
(17, 3, 8),
(18, 1, 9),
(19, 2, 10),
(82, 3, 18),
(82, 4, 19),
(82, 5, 20),
(112, 1, 35),
(112, 2, 36);

-- --------------------------------------------------------

--
-- Table structure for table `incomes`
--

CREATE TABLE `incomes` (
  `id` bigint(20) NOT NULL,
  `note` varchar(500) NOT NULL,
  `transaction_id` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `incomes`
--

INSERT INTO `incomes` (`id`, `note`, `transaction_id`, `wallet_id`) VALUES
(1, 'Dummy', 65, 12),
(2, '', 66, 12);

-- --------------------------------------------------------

--
-- Table structure for table `other_wallet`
--

CREATE TABLE `other_wallet` (
  `id` bigint(20) NOT NULL,
  `note` varchar(500) NOT NULL,
  `wallet_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `other_wallet`
--

INSERT INTO `other_wallet` (`id`, `note`, `wallet_id`) VALUES
(1, 'Simple Notw', 12),
(2, '', 16),
(3, '', 17);

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` bigint(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  `color` varchar(10) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `color`, `user_id`) VALUES
(1, 'saff', '#44545', 1),
(2, 'asdase', '#44545', 1),
(3, 'wewe', '#44545', 1),
(4, 'gfhfgj', '#44545', 1),
(5, 'fjgfj', '#44545', 1);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `amount` bigint(20) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `type`, `amount`, `timestamp`, `user_id`) VALUES
(11, 'expense', 123, '2022-12-13 11:54:37', 1),
(13, 'expense', 567, '2022-12-13 11:55:08', 1),
(15, 'expense', 120, '2022-12-13 11:57:15', 1),
(16, 'expense', 230, '2022-12-13 11:57:27', 1),
(17, 'expense', 12, '2022-12-13 11:57:44', 1),
(18, 'expense', 10, '2022-12-13 11:57:50', 1),
(19, 'expense', 213, '2022-12-13 11:57:55', 1),
(20, 'expense', 30, '2022-12-13 12:15:04', 1),
(21, 'expense', 19, '2022-12-13 12:15:53', 1),
(22, 'expense', 123, '2022-12-13 13:16:48', 1),
(23, 'expense', 123, '2022-12-13 13:16:57', 1),
(24, 'expense', 23, '2022-12-13 13:17:07', 1),
(25, 'expense', 23, '2022-12-13 13:17:23', 1),
(26, 'expense', 23, '2022-12-13 13:17:31', 1),
(27, 'expense', 23, '2022-12-13 13:17:40', 1),
(30, 'expense', 2, '2022-12-14 11:29:44', 1),
(31, 'expense', 123, '2022-12-14 11:32:20', 1),
(36, 'expense', 51, '2022-12-14 18:01:55', 1),
(65, 'income', 1200, '2022-12-15 13:59:11', 1),
(66, 'income', 213, '2022-12-15 13:59:29', 1),
(69, 'expense', 100, '2022-12-16 10:18:22', 1),
(70, 'expense', 101, '2022-12-16 10:18:26', 1),
(71, 'expense', 100, '2022-12-16 10:18:30', 1),
(72, 'expense', 43, '2022-12-16 10:18:34', 1),
(73, 'expense', 23, '2022-12-16 10:18:40', 1),
(74, 'expense', 1, '2022-12-16 10:18:46', 1),
(75, 'expense', 100, '2022-12-16 10:18:52', 1),
(76, 'expense', 30, '2022-12-16 10:19:02', 1),
(77, 'expense', 56, '2022-12-16 10:19:16', 1),
(78, 'expense', 12, '2022-12-16 17:54:38', 1),
(79, 'expense', 45, '2022-12-16 18:04:19', 1),
(81, 'expense', 34, '2022-12-17 06:52:40', 1),
(84, 'expense', 67, '2022-12-17 07:31:33', 1),
(85, 'expense', 20, '2022-12-19 05:16:49', 1),
(86, 'expense', 12, '2022-12-19 05:17:38', 1),
(87, 'expense', 123, '2022-12-19 05:18:09', 1),
(88, 'expense', 10, '2022-12-19 05:37:29', 1),
(89, 'expense', 12, '2022-12-19 05:39:47', 1),
(90, 'expense', 150, '2022-12-19 05:48:51', 1),
(105, 'expense', 12, '2022-12-19 12:49:48', 1),
(107, 'expense', 10, '2022-12-19 12:49:56', 1),
(108, 'expense', 120, '2022-12-19 12:50:01', 1),
(109, 'expense', 12, '2022-12-20 07:20:37', 1),
(112, 'expense', 42, '2022-12-20 07:44:00', 1),
(114, 'expense', 12, '2022-12-20 13:09:08', 1),
(116, 'expense', 120, '2022-12-21 05:21:01', 1);

-- --------------------------------------------------------

--
-- Table structure for table `transfers`
--

CREATE TABLE `transfers` (
  `id` bigint(20) NOT NULL,
  `wallet_to` bigint(20) NOT NULL,
  `note` varchar(500) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `transaction_id` bigint(20) NOT NULL,
  `wallet_from` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(20) NOT NULL,
  `phone_number` varchar(10) NOT NULL,
  `email` varchar(50) NOT NULL,
  `session_key` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `password`, `phone_number`, `email`, `session_key`) VALUES
(1, 'Karthi', '12345', '1234567890', 'karthi@gmail.com', '69799a54bf9401b7f75e4a4012e08dd4');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `archive_wallet` tinyint(1) NOT NULL,
  `balance` bigint(20) NOT NULL,
  `exclude_from_stats` tinyint(1) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `deleted` smallint(6) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `name`, `type`, `archive_wallet`, `balance`, `exclude_from_stats`, `user_id`, `deleted`) VALUES
(1, 'Indian Bank', 'Bank Account', 1, 8162, 0, 1, 1),
(2, 'Hello', 'Bank Account', 1, 1000, 0, 1, 1),
(3, 'HDFC Bank Credit Card', 'Credit Card', 1, 10000, 0, 1, 1),
(4, 'ICICI Card', 'Credit Card', 1, 12000, 0, 1, 1),
(5, 'Indian Bank', 'Bank Account', 1, 10000, 0, 1, 1),
(6, 'Diwali Bonus 1', 'Bonus Account', 1, 10000, 0, 1, 1),
(11, 'Zoho Bonus Card', 'Bonus Account', 0, 9900, 0, 1, 0),
(12, 'Zomato Coupen', 'Other', 0, 2553, 0, 1, 0),
(13, 'HDFC Credit Card', 'Credit Card', 0, 11239, 0, 1, 0),
(14, 'ICICI Card', 'Credit Card', 0, 9954, 0, 1, 0),
(15, 'Indian Bank Card ', 'Credit Card', 0, 12000, 0, 1, 0),
(16, 'Amazon Balance', 'Other', 0, 12000, 0, 1, 0),
(17, 'Phone Phe Wallet', 'Other', 0, 12300, 0, 1, 0),
(20, 'Indian Bank', 'Bank Account', 0, 11944, 0, 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bank_wallet`
--
ALTER TABLE `bank_wallet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bank_wallet_wallets_id` (`wallet_id`);

--
-- Indexes for table `bonus_wallet`
--
ALTER TABLE `bonus_wallet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bonus_wallet_wallets_id` (`wallet_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_categories_user_id` (`user_id`);

--
-- Indexes for table `credit_card_wallet`
--
ALTER TABLE `credit_card_wallet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_credit_card_wallet_wallets_id` (`wallet_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_expenses_transaction_id` (`transaction_id`);

--
-- Indexes for table `expense_split`
--
ALTER TABLE `expense_split`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_expense_split_expenses_id` (`expense_id`);

--
-- Indexes for table `expense_tag_mapping`
--
ALTER TABLE `expense_tag_mapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_expense_tag_mapping_expense_id` (`expense_id`),
  ADD KEY `fk_expense_tag_mapping_tag_id` (`tag_id`);

--
-- Indexes for table `incomes`
--
ALTER TABLE `incomes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_incomes_transactions_id` (`transaction_id`);

--
-- Indexes for table `other_wallet`
--
ALTER TABLE `other_wallet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_other_wallet_wallets_id` (`wallet_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tags_user_id` (`user_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_transactions_user_id` (`user_id`);

--
-- Indexes for table `transfers`
--
ALTER TABLE `transfers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_transfers_transactions_id` (`transaction_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone_number` (`phone_number`),
  ADD UNIQUE KEY `session_key` (`session_key`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bank_wallet`
--
ALTER TABLE `bank_wallet`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `bonus_wallet`
--
ALTER TABLE `bonus_wallet`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `credit_card_wallet`
--
ALTER TABLE `credit_card_wallet`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `expense_split`
--
ALTER TABLE `expense_split`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `expense_tag_mapping`
--
ALTER TABLE `expense_tag_mapping`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `incomes`
--
ALTER TABLE `incomes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `other_wallet`
--
ALTER TABLE `other_wallet`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bank_wallet`
--
ALTER TABLE `bank_wallet`
  ADD CONSTRAINT `fk_bank_wallet_wallets_id` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);

--
-- Constraints for table `bonus_wallet`
--
ALTER TABLE `bonus_wallet`
  ADD CONSTRAINT `fk_bonus_wallet_wallets_id` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `credit_card_wallet`
--
ALTER TABLE `credit_card_wallet`
  ADD CONSTRAINT `fk_credit_card_wallet_wallets_id` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `fk_expenses_transaction_id` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`);

--
-- Constraints for table `expense_split`
--
ALTER TABLE `expense_split`
  ADD CONSTRAINT `fk_expense_split_expenses_id` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`);

--
-- Constraints for table `expense_tag_mapping`
--
ALTER TABLE `expense_tag_mapping`
  ADD CONSTRAINT `fk_expense_tag_mapping_expense_id` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`),
  ADD CONSTRAINT `fk_expense_tag_mapping_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`);

--
-- Constraints for table `incomes`
--
ALTER TABLE `incomes`
  ADD CONSTRAINT `fk_incomes_transactions_id` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`);

--
-- Constraints for table `other_wallet`
--
ALTER TABLE `other_wallet`
  ADD CONSTRAINT `fk_other_wallet_wallets_id` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);

--
-- Constraints for table `tags`
--
ALTER TABLE `tags`
  ADD CONSTRAINT `fk_tags_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `transfers`
--
ALTER TABLE `transfers`
  ADD CONSTRAINT `fk_transfers_transactions_id` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
