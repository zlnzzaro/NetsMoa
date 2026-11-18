package com.netogether.backend;

import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PostController {

	private final JdbcClient jdbc;

	public PostController(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	@GetMapping("/api/v1/posts")
	public List<PostItem> listPosts() {
		return jdbc.sql("""
				SELECT title, category, status
				FROM posts
				ORDER BY created_at DESC, id DESC
				LIMIT 20
				""")
				.query(PostItem.class)
				.list();
	}

	public record PostItem(String title, String category, String status) {
	}
}