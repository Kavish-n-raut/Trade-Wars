import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  Badge,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      bg="rgba(26, 31, 46, 0.95)"
      backdropFilter="blur(10px)"
      px={8}
      py={4}
      borderBottom="1px solid"
      borderColor="rgba(0, 217, 255, 0.2)"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"}>
          <HStack spacing={2}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
            >
              📊 E-Summit Stock Exchange
            </Text>
          </HStack>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <HStack spacing={8}>
            <Link to="/dashboard">
              <Text
                fontSize="lg"
                _hover={{ color: "brand.400" }}
                transition="all 0.2s"
              >
                Dashboard
              </Text>
            </Link>
            <Link to="/portfolio">
              <Text
                fontSize="lg"
                _hover={{ color: "brand.400" }}
                transition="all 0.2s"
              >
                Portfolio
              </Text>
            </Link>
            {/* Only show Leaderboard link if user is admin */}
            {isAdmin && (
              <Link to="/leaderboard">
                <Text
                  fontSize="lg"
                  _hover={{ color: "brand.400" }}
                  transition="all 0.2s"
                >
                  Leaderboard
                </Text>
              </Link>
            )}
            <Link to="/news">
              <Text
                fontSize="lg"
                _hover={{ color: "brand.400" }}
                transition="all 0.2s"
              >
                News
              </Text>
            </Link>
            {/* Only show Admin link if user is admin */}
            {isAdmin && (
              <Link to="/admin">
                <Badge
                  colorScheme="purple"
                  fontSize="md"
                  px={3}
                  py={1}
                  borderRadius="md"
                >
                  👑 Admin
                </Badge>
              </Link>
            )}
          </HStack>
        )}

        {/* Right Side */}
        <HStack spacing={4}>
          {isAuthenticated ? (
            <>
              <Text fontSize="sm" color="gray.400">
                Welcome, <strong>{user?.username}</strong>
                {isAdmin && (
                  <Badge ml={2} colorScheme="purple" fontSize="xs">
                    ADMIN
                  </Badge>
                )}
              </Text>
              <Button
                colorScheme="red"
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <HStack spacing={2}>
              <Button
                as={Link}
                to="/login"
                colorScheme="brand"
                variant="ghost"
                size="sm"
              >
                Login
              </Button>
              <Button
                as={Link}
                to="/register"
                colorScheme="brand"
                size="sm"
              >
                Register
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;