import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 📝게시글 등록 함수
const createArticle = async (req, res) => {
  try {
    const { nickname, title, content, image } = req.body;
    const newArticle = await prisma.article.create({
      data: {
        nickname,
        title,
        content,
        image,
        Heart: 0, // 기본 좋아요 수 0
      },
    });
    res.status(201).send(newArticle);
  } catch (err) {
    console.log("에러 확인용", err);
    res.status(500).send({
      message: "게시글 등록 중 오류가 발생했습니다.",
    });
  }
};

// 📝게시글 목록 조회 함수
const getArticle = async (req, res) => {
  try {
    const { searchQuery = "", sortType = "latest", limit = 10, skip = 0 } = req.query; // 쿼리 파라미터로 검색어, 정렬, limit, skip 등을 받음

    // 데이터 가져오기 (데이터베이스에서 가져오는 코드 예시)
    const articles = await getArticlesFromDB();

    // 검색 필터링
    const filteredArticles = articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 정렬
    const sortedArticles = filteredArticles.sort((a, b) => {
      if (sortType === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt); // 최신순 정렬
      } else if (sortType === "heart") {
        return b.Heart - a.Heart; // 좋아요 순 정렬
      }
      return 0;
    });

    // 페이징 처리
    const paginatedArticles = sortedArticles.slice(skip, skip + Number(limit));

    // 상위 3개의 인기 게시글 (예: 좋아요 순)
    const topArticles = articles.sort((a, b) => b.Heart - a.Heart).slice(0, 3);

    // 총 데이터 개수 (전체 게시글 개수)
    const totalCount = filteredArticles.length;

    res.send({
      articles: paginatedArticles,
      topArticles,
      totalCount
    });
  } catch (err) {
    console.log("에러 확인용", err);
    res.status(500).send({
      message: "게시글 조회 중 오류가 발생했습니다.",
    });
  }
};

// 📝게시글 단일 조회 함수
const getIdArticle = async (req, res) => {
  try {
    const id = req.params.id;
    // findById -> findUnique로 수정
    const article = await prisma.article.findUnique({
      where: {
        id: id, // id를 기준으로 조회
      },
    });

    if (!article) {
      res.status(404).send({ message: "해당 게시글을 찾을 수 없습니다." });
    } else {
      res.status(200).send(article);
    }
  } catch (err) {
    console.error("에러 확인용", err);
    res.status(500).send({
      message: "게시글 조회 중 오류가 발생했습니다.",
    });
  }
};

// 📝게시글 수정 함수
const updateArticle = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedArticle = await prisma.article.update({
      where: { id: id },
      data: req.body, // 요청 본문을 기반으로 게시글 데이터 업데이트
    });
    res.send(updatedArticle);
  } catch (err) {
    console.log("에러 확인용", err);
    res.status(500).send({
      message: "게시글 수정 중 오류가 발생했습니다.",
    });
  }
};

// 📝게시글 삭제 함수
const deleteArticle = async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.article.delete({
      where: { id: id },
    });
    res.status(200).send({
      message: "게시글이 삭제되었습니다.",
    });
  } catch (err) {
    console.log("에러 확인용", err);
    res.status(500).send({
      message: "게시글 삭제 중 오류가 발생했습니다.",
    });
  }
};

// 서비스 객체에 함수들 추가
const articleService = {
  createArticle,
  getArticle,
  getIdArticle,
  updateArticle,
  deleteArticle,
};

export default articleService;
