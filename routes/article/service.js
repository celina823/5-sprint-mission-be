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
    const { page = 1, limit = 4, searchQuery = "" } = req.query; // 기본값: page=1, limit=4

    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    const take = limit;

    // 검색어가 있을 경우, 해당 검색어로 제목을 필터링
    const articles = await prisma.article.findMany({
      skip,
      take,
      where: {
        title: {
          contains: searchQuery, // 제목에 검색어가 포함된 게시글만 조회
          mode: 'insensitive',   // 대소문자 구분 없이 검색
        },
      },
      include: { comments: true }, // 댓글도 포함해서 게시글 조회
    });
    const totalArticles = await prisma.article.count({
      where: {
        title: {
          contains: searchQuery, // 제목에 검색어가 포함된 게시글만 조회
          mode: 'insensitive',
        },
      },
    }); // 총 게시글 수 조회
    const totalPages = Math.ceil(totalArticles / limit); // 총 페이지 수 계산

    res.send({
      articles,
      page,
      totalPages,
      totalArticles,
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
